const mockDeviceInstance = {
  isScreenSizeMin: jest.fn().mockReturnValue(true)
};

const mockIsScreenSizeMinMock = jest.fn().mockReturnValue(true);
export default {
  __esModule: true,
  default: mockDeviceInstance,
  get isScreenSizeMin() {
    return mockIsScreenSizeMinMock;
  }
};
