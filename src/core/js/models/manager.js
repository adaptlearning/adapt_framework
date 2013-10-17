ADAPT.register('manager', 'model', {
    
    initialize: function() {
        console.log('Manager Model created');
        this.once('sync', this.setup, this);
        this.fetch();
    },
    
    url:'course/config.json',
    
    setup: function() {
        var that = this;
        this.hub.trigger('setup:settings', this);
        Modernizr.load([
            this.get('theme'),
            this.get('components'),
            this.get('menu'),
            {
                load:this.get('extensions'),
                complete:function() {
                    ADAPT.init();
                }
            }
        ]);
    }
    
});