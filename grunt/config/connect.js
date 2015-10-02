module.exports = {
    server: {
      options: {
        port: 9001,
        base: '<%= outputdir %>',
        keepalive:true
      }
    },
    spoorOffline: {
        options: {
            port: 9001,
            base: '<%= outputdir %>',
            keepalive:true
        }
    }
}
