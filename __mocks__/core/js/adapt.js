export default {
  course: {
    get: jest.fn().mockReturnValue(
      {
        _components: {
          _text: {
            ariaRegion: 'Text Component Aria Text'
          }
        },
        _extensions: {
          _glossary: {
            ariaRegion: 'Glossary Extension Aria Text'
          }
        }
      }
    )
  }
};
