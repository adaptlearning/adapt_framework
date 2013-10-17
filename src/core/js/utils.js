define(["backbone", "handlebars", "coreJS/adapt"], function(Backbone, Handlebars, Adapt) {

    // Utilities
    // ---------
    
    // Change attribute to lowercase
    // {{lowerCase title}}
    Handlebars.registerHelper("lowerCase", function(text) {
        return text.toLowerCase();
    });
    
    // Change index to numbers starting from 1
    // {{numbers @index}}
    Handlebars.registerHelper("numbers", function(index) {
        return index +1;
    });
    
});