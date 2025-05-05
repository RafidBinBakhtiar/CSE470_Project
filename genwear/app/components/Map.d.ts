import { FC } from 'react';

interface MapProps {
  center?: [number, number];
  zoom?: number;
}

declare const Map: FC<MapProps>;
export default Map; 