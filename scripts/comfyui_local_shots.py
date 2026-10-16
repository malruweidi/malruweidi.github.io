#!/usr/bin/env python3
"""Queue provenance-marked film shots on a *local* ComfyUI instance.

Requires an API-format local-only ComfyUI workflow exported from the desktop UI.
No hosted vendor API, account, credit, watermark service, or proprietary SaaS call.
This bridge does not magically provide GPUs or checkpoints.
"""
from __future__ import annotations
import argparse
import copy
import hashlib
import json
import pathlib
import re
import time
from urllib import parse, request

DEFAULT_SERVER = 'http://127.0.0.1:8188'
PROHIBITED = re.compile(r'(?i)(?:api(?:node)?|openai|kling|runway|replicate|falai|fal_|luma|sora|veo|pika|seedance|partner)')
SHOT_ID = re.compile(r'^[a-zA-Z0-9][a-zA-Z0-9_-]{1,64}$')


def require_local_url(url: str) -> str:
    parsed = parse.urlparse(url)
    if parsed.scheme != 'http' or parsed.hostname not in ('127.0.0.1','localhost','::1') or parsed.username or parsed.password or parsed.path not in ('','/') or parsed.query or parsed.fragment:
        raise ValueError('Only a local HTTP ComfyUI instance is accepted; external endpoints are disabled')
    return url.rstrip('/')


def validate_job(job: dict) -> dict:
    if not isinstance(job, dict) or not SHOT_ID.fullmatch(str(job.get('id',''))):
        raise ValueError('Shot needs an alphanumeric id (letters/numbers/_/-)')
    for k in ('prompt','prompt_node','provenance'):
        if not isinstance(job.get(k), str) or not job[k].strip():
            raise ValueError('Missing '+k+'; each shot needs evidence/provenance')
    if not any(x in job['provenance'].lower() for x in ('conceptual','illustrat','original','archiv','reference','experiment','historical')):
        raise ValueError('Shot provenance must indicate original evidence or reconstruction status')
    return job


def prepare_workflow(workflow: dict, prompt_node: str, prompt: str, seed_node: str | None = None, seed: int | None = None) -> dict:
    if not isinstance(workflow, dict) or not workflow:
        raise ValueError('ComfyUI workflow must be an API-format node object')
    for n in workflow.values():
        if not isinstance(n,dict) or not isinstance(n.get('inputs'),dict):
            raise ValueError('Use File > Export (API), not a UI canvas workflow')
        node_type=str(n.get('class_type',''))
        if PROHIBITED.search(node_type) or any(re.search(r'(?i)(?:api_key|access_token|auth_token|endpoint_url)',str(k)) for k in n['inputs']):
            raise ValueError('Workflow contains external or credit-based service node: '+node_type)
    result=copy.deepcopy(workflow)
    if prompt_node not in result or 'text' not in result[prompt_node]['inputs']:
        raise ValueError('Text prompt node ID is not present in exported workflow')
    result[prompt_node]['inputs']['text']=prompt
    if seed is not None:
        if seed_node is None or seed_node not in result or 'seed' not in result[seed_node]['inputs']:
            raise ValueError('Seed node not present in workflow')
        result[seed_node]['inputs']['seed']=int(seed)
    return result


def save_result(path: pathlib.Path, data: bytes):
    path.parent.mkdir(parents=True,exist_ok=True)
    with path.open('xb') as fh:
        fh.write(data)


def api_json(server: str, route: str, payload: dict | None = None) -> dict:
    body=None if payload is None else json.dumps(payload).encode('utf-8')
    req=request.Request(server+route,data=body,headers={'Content-Type':'application/json'} if body else {},method='POST' if body else 'GET')
    with request.urlopen(req,timeout=30) as response:
        return json.load(response)


def run_job(server: str, workflow: dict, job: dict, output: pathlib.Path, timeout_seconds: int):
    prepared=prepare_workflow(workflow,str(job['prompt_node']),job['prompt'],str(job['seed_node']) if 'seed_node' in job else None, job.get('seed'))
    workflow_digest=hashlib.sha256(json.dumps(prepared,ensure_ascii=False,sort_keys=True).encode('utf-8')).hexdigest()
    queued=api_json(server,'/prompt',{'prompt':prepared})
    prompt_id=queued.get('prompt_id')
    if not prompt_id or not re.fullmatch(r'[a-fA-F0-9-]{10,64}',str(prompt_id)):
        raise RuntimeError('ComfyUI did not return a recognized prompt_id: '+repr(queued))
    deadline=time.monotonic()+timeout_seconds
    outputs=[]
    while time.monotonic()<deadline:
        history=api_json(server,'/history/'+parse.quote(prompt_id))
        record=history.get(prompt_id)
        if record and record.get('status',{}).get('status_str')=='error':
            raise RuntimeError('ComfyUI reported generation failure: '+str(record.get('status')))
        if record and record.get('outputs'):
            for node_info in record['outputs'].values():
                for kind in ('gifs','images','videos'):
                    for asset in node_info.get(kind,[]):
                        if asset.get('filename'):
                            outputs.append(asset)
            if outputs: break
        time.sleep(2)
    if not outputs:
        raise TimeoutError('No completed ComfyUI output before timeout; request ID '+prompt_id)
    asset=next((x for x in outputs if pathlib.Path(x['filename']).suffix.lower() in ('.mp4','.webm','.mov')),outputs[0])
    filename=str(asset['filename'])
    if pathlib.Path(filename).name != filename:
        raise ValueError('Unsafe generated filename from ComfyUI')
    params=parse.urlencode({'filename':filename,'subfolder':asset.get('subfolder',''),'type':asset.get('type','output')})
    with request.urlopen(server+'/view?'+params,timeout=120) as resp:
        data=resp.read()
    if len(data)<100:
        raise RuntimeError('ComfyUI output file unexpectedly small')
    file=output/(job['id']+pathlib.Path(filename).suffix.lower())
    save_result(file,data)
    record={ 'shot_id':job['id'], 'type':'GENERATED CONCEPTUAL SHOT, NOT PRIMARY EVIDENCE',
             'provenance':job['provenance'], 'prompt':job['prompt'],'server':'local ComfyUI',
             'workflow_sha256':workflow_digest,'sha256':hashlib.sha256(data).hexdigest(),
             'output':file.name,'approval':'UNREVIEWED, NOT FOR AUTO-PUBLICATION'}
    save_result(output/(job['id']+'.provenance.json'),(json.dumps(record,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
    return record


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plan',type=pathlib.Path,required=True)
    parser.add_argument('--workflow',type=pathlib.Path,required=True,help='ComfyUI export in API format; local model nodes only')
    parser.add_argument('--output',type=pathlib.Path,required=True)
    parser.add_argument('--server',default=DEFAULT_SERVER)
    parser.add_argument('--timeout-seconds',type=int,default=1800)
    parser.add_argument('--validate-only',action='store_true')
    args=parser.parse_args()
    server=require_local_url(args.server)
    plan=json.loads(args.plan.read_text(encoding='utf-8'))
    workflow=json.loads(args.workflow.read_text(encoding='utf-8'))
    jobs=plan.get('shots',[])
    if not jobs or len(jobs)>50:raise ValueError('Plan must contain 1–50 shots')
    seen=set()
    for job in jobs:
        validate_job(job)
        if job['id'] in seen:raise ValueError('Duplicate shot id: '+job['id'])
        seen.add(job['id'])
        prepare_workflow(workflow,str(job['prompt_node']),job['prompt'],str(job['seed_node']) if 'seed_node' in job else None,job.get('seed'))
    if args.validate_only:
        print('VALIDATED local-only ComfyUI plan:',len(jobs),'shots; no generation or publishing')
        return
    results=[]
    for job in jobs:
        results.append(run_job(server,workflow,job,args.output,args.timeout_seconds))
        print('QUEUED AND SAVED:',job['id'])
    print('Review-only outputs:',len(results),str(args.output))

if __name__=='__main__':
    main()