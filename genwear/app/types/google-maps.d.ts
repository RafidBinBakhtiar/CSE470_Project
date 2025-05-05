declare namespace google.maps {
  class Map {
    constructor(element: HTMLElement, options: MapOptions);
  }

  class Marker {
    constructor(options: MarkerOptions);
  }

  interface MapOptions {
    center: LatLngLiteral;
    zoom: number;
    styles?: MapTypeStyle[];
  }

  interface MarkerOptions {
    position: LatLngLiteral;
    map: Map;
    title?: string;
    animation?: Animation;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface MapTypeStyle {
    featureType?: string;
    elementType?: string;
    stylers: MapTypeStyler[];
  }

  interface MapTypeStyler {
    color?: string;
    lightness?: number;
    saturation?: number;
    visibility?: string;
  }

  enum Animation {
    DROP,
    BOUNCE
  }
} 