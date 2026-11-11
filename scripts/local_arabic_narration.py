#!/usr/bin/env python3
"""Commercial-licence-friendly, self-hosted Arabic narration auditions.

Requires Resemble AI's MIT-licensed Chatterbox Multilingual v3 and a GPU or
sufficient CPU resources. Audio is for pronunciation audition, not automatic
approval. A cloned reference voice requires explicit speaker permission.
"""
import argparse
import hashlib
import json
from pathlib import Path


def validate_script(data: dict):
    if data.get('language') != 'ar' or not isinstance(data.get('segments'), list) or not data['segments']:
        raise ValueError('Use Arabic language code ar and a nonempty segments list')
    if len(data['segments']) > 80:
        raise ValueError('At most 80 short narration segments per job')
    for i, line in enumerate(data['segments'], 1):
        if not isinstance(line, str) or not line.strip() or len(line) > 600:
            raise ValueError(f'Segment {i} is empty or too long; split at natural pauses')
    return data


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--script', type=Path, required=True, help='JSON: {"language":"ar","segments":["..."]}')
    p.add_argument('--output', type=Path, required=True)
    p.add_argument('--voice-reference',type=Path,help='Speaker-authorized 5–15 second native-Arabic voice sample')
    p.add_argument('--voice-consent',action='store_true',help='Confirm explicit speaker permission for the reference voice')
    p.add_argument('--device',choices=('cuda','cpu','mps'),default='cuda')
    p.add_argument('--validate-only',action='store_true')
    args=p.parse_args()
    data=validate_script(json.loads(args.script.read_text(encoding='utf-8')))
    if args.voice_reference and not args.voice_consent:
        p.error('Voice references require --voice-consent; do not imitate a third party without permission')
    if args.voice_reference and not args.voice_reference.is_file():
        p.error('Reference recording does not exist')
    if args.validate_only:
        print('VALIDATED:',len(data['segments']),'Arabic narration segments; no generation')
        return
    if args.output.exists() and any(args.output.iterdir()):
        p.error('Output directory is not empty: narration is immutable until review')
    # Delayed imports allow --validate-only without installing large ML checkpoints.
    import torchaudio
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    model=ChatterboxMultilingualTTS.from_pretrained(device=args.device,t3_model='v3')
    args.output.mkdir(parents=True,exist_ok=True)
    record={'engine':'ResembleAI Chatterbox Multilingual V3, locally run',
            'status':'ARABIC NARRATION AUDITION, PRONUNCIATION UNREVIEWED',
            'language':'ar','voice_reference_consent':bool(args.voice_consent), 'segments':[]}
    for i,text in enumerate(data['segments'],1):
        kwargs={'language_id':'ar'}
        if args.voice_reference:kwargs['audio_prompt_path']=str(args.voice_reference)
        wav=model.generate(text,**kwargs)
        file=args.output/f'{i:02}.wav'
        torchaudio.save(str(file),wav,model.sr)
        record['segments'].append({'id':i,'text':text,'file':file.name,
                                   'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),
                                   'approval':'NEEDS HUMAN ARABIC LISTENING PASS'})
        print('Narration audition segment:',i)
    (args.output/'narration-auditions.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':main()