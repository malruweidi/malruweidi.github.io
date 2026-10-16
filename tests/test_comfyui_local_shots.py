import importlib.util
import json
import pathlib
import tempfile
import unittest

SOURCE = pathlib.Path(__file__).resolve().parents[1] / 'scripts' / 'comfyui_local_shots.py'
spec = importlib.util.spec_from_file_location('comfyui_local_shots', SOURCE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class CinemaBridgeTests(unittest.TestCase):
    def workflow(self):
        return {'6': {'class_type':'CLIPTextEncode','inputs':{'text':'original'}},
                '3': {'class_type':'KSampler','inputs':{'seed':11}}}

    def test_injects_prompt_without_mutating_workflow(self):
        wf = self.workflow()
        output = module.prepare_workflow(wf, '6', 'mist across glass', seed_node='3', seed=19)
        self.assertEqual(output['6']['inputs']['text'], 'mist across glass')
        self.assertEqual(output['3']['inputs']['seed'], 19)
        self.assertEqual(wf['6']['inputs']['text'], 'original')

    def test_rejects_cloud_api_nodes(self):
        wf = self.workflow(); wf['9'] = {'class_type':'OpenAIApiNode','inputs':{}}
        with self.assertRaisesRegex(ValueError, 'external or credit'):
            module.prepare_workflow(wf, '6', 'hello')

    def test_rejects_unintended_host(self):
        with self.assertRaises(ValueError):
            module.require_local_url('https://some-api-host.example:8188')
        self.assertEqual(module.require_local_url('http://127.0.0.1:8188'), 'http://127.0.0.1:8188')

    def test_does_not_overwrite_output(self):
        with tempfile.TemporaryDirectory() as d:
            path = pathlib.Path(d) / 'shot.mp4'
            path.write_bytes(b'old')
            with self.assertRaises(FileExistsError):
                module.save_result(path, b'new')
            self.assertEqual(path.read_bytes(), b'old')

    def test_validates_purpose_and_source_metadata(self):
        with self.assertRaisesRegex(ValueError, 'provenance'):
            module.validate_job({'id':'sh','prompt':'x','prompt_node':'6'})
        result = module.validate_job({'id':'shot-01','prompt':'alchemical syrup slowly crystallizing', 'prompt_node':'6','provenance':'CONCEPTUAL RECONSTRUCTION, NOT HISTORICAL FOOTAGE'})
        self.assertEqual(result['id'], 'shot-01')

if __name__=='__main__': unittest.main()