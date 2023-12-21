export interface AndroidOffsets {
  [key: number]: {
    // The height of the status bar
    STATUS_BAR: number;
    // The height of the address bar
    ADDRESS_BAR: number;
    // The height of the tool bar
    TOOL_BAR: number;
  };
}

enum IosDeviceEnum {
  IPAD = 'IPAD',
  IPHONE = 'IPHONE',
}

enum OrientationEnum {
  LANDSCAPE = 'LANDSCAPE',
  PORTRAIT = 'PORTRAIT',
}

export type IosOffsets = {
  [key in IosDeviceEnum]: {
    // The portrait height of the device
    [key: number]: {
      [key in OrientationEnum]: {
        ADDRESS_BAR: number;
        HOME_BAR: {
          x: number;
          y: number;
          height: number;
          width: number;
        };
        SAFE_AREA: number;
        STATUS_BAR: number;
      };
    };
  };
};
