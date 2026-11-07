import React from 'react';
import {Composition} from 'remotion';
import {MolecularTransport} from './MolecularTransport';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MolecularTransport"
    component={MolecularTransport}
    fps={30}
    durationInFrames={450}
    width={1920}
    height={1080}
  />
);
