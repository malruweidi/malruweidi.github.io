import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location('local_arabic_narration',Path(__file__).resolve().parents[1]/'scripts'/'local_arabic_narration.py')
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
class ArabicNarrationTests(unittest.TestCase):
    def test_arabic_segments_accepted(self):
        self.assertEqual(mod.validate_script({'language':'ar','segments':['تعليم اللغة العربية']})['language'],'ar')
    def test_wrong_language_rejected(self):
        with self.assertRaises(ValueError):mod.validate_script({'language':'en','segments':['Hello']})
    def test_extremely_long_segment_rejected(self):
        with self.assertRaises(ValueError):mod.validate_script({'language':'ar','segments':['ا'*601]})
if __name__=='__main__':unittest.main()