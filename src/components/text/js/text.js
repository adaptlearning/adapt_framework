define(["coreViews/componentView", "coreJS/adapt"], function(ComponentView, Adapt) {

    var Text = ComponentView.extend({
        
        postRender: function() {
            console.log("rendering");
            this.setReadyListener();
            this.setCompletionListener();
        }
        
    });
    
    Adapt.register("text", Text);
    
});