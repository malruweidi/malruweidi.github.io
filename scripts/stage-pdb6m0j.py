#!/usr/bin/env python3
"""Fetch *experimentally determined* PDB 6M0J coordinates for Ruwaidix ACE2.

Keeps the original RCSB PDB record intact and validates ACE2 chain A and
SARS-CoV-2 RBD chain E. 6M0J is NOT a complete viral spike, a whole cell,
or membrane-shedding experiment.
"""
from pathlib import Path
import hashlib,json,urllib.request
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets/films/source-structures/pdb-6m0j"
SOURCE="https://files.rcsb.org/download/6M0J.pdb"
def main():
 req=urllib.request.Request(SOURCE,headers={"User-Agent":"Ruwaidix-primary-structure-cinema/3.0","Accept":"text/plain"})
 with urllib.request.urlopen(req,timeout=55) as resp:
  data=resp.read(8_000_000)
 text=data.decode("ascii",errors="replace")
 if len(data)<250_000 or "6M0J" not in text[:2000] or not text.startswith("HEADER"):
  raise ValueError("Deposited structure identity cannot be confirmed as 6M0J.")
 if "ANGIOTENSIN-CONVERTING ENZYME 2" not in text or "SPIKE" not in text.upper():
  raise ValueError("Wrong molecular entities in deposited file.")
 chain_atoms={}
 residues={}
 for ln in text.splitlines():
  if not ln.startswith("ATOM  ") or ln[12:16].strip()!="CA":continue
  chain=ln[21].strip()
  residues.setdefault(chain,{}).setdefault((ln[22:26],ln[26]),(float(ln[30:38]),float(ln[38:46]),float(ln[46:54])))
 counts={key:len(val) for key,val in residues.items()}
 # In 6M0J auth chain E is SARS-CoV-2 RBD. Verify identities against official
 # RCSB entry separately; never reassign from a biological assembly guess.
 if counts.get("A",0)<400 or counts.get("E",0)<150:
  raise ValueError("ACE2 chain A and RBD chain E unexpectedly absent: "+repr(counts))
 OUT.mkdir(parents=True,exist_ok=True)
 dest=OUT/"6M0J.pdb";dest.write_bytes(data)
 meta={
  "id":"6M0J","pdb_source":SOURCE,"entry":"https://www.rcsb.org/structure/6M0J",
  "citation":"Lan J et al., Structure of the SARS-CoV-2 spike receptor-binding domain bound to the ACE2 receptor. Nature 581, 215-220 (2020). DOI 10.1038/s41586-020-2180-5.",
  "pdb_doi":"10.2210/pdb6M0J/pdb","method":"X-ray diffraction","resolution_angstrom":2.45,
  "chains":{"A":"human ACE2 extracellular protease domain (part of ACE2 only)","E":"SARS-CoV-2 Spike S1 receptor-binding domain"},
  "ca_counts_by_auth_chain":counts,
  "sha256":hashlib.sha256(data).hexdigest(),
  "scope":"Experimental receptor-RBD interface, not whole virus/full spike, not membrane orientation or soluble-protein dynamics.",
  "reuse":"PDB coordinates distributed via wwPDB public archive; credit structure deposition and primary paper.",
  "film_status":"Source verified and staged for coordinate-based rendering; not yet editorial approved."
 }
 (OUT/"structure-provenance.json").write_text(json.dumps(meta,indent=2)+"\n",encoding="utf8")
 print("6M0J verified ACE2/RBD structure",counts)
if __name__=="__main__":main()
