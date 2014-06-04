define(function (require) {

    var Backbone = require('backbone');
    var Adapt = {};
    var Adapt = require('coreJS/adapt');
    Adapt.course = new Backbone.Model();
    Adapt.contentObjects = new Backbone.Collection();
    Adapt.articles = new Backbone.Collection();
    Adapt.blocks = new Backbone.Collection();
    Adapt.components = new Backbone.Collection();
    var BackboneModel = require('coreModels/backboneModel');
    var AdaptModel = require('coreModels/adaptModel');
    var ContentObjectModel = require('coreModels/contentObjectModel');
    var ArticleModel = require('coreModels/articleModel');
    var BlockModel = require('coreModels/blockModel');
    var ComponentModel = require('coreModels/componentModel');

    Adapt.course = new Backbone.Model({
        "_id": "course",
        "_type": "course",
        "title": "Welcome to Adapt Learning - v1.0.0",
        "body": "This release is aimed at developers who want to get involved with the Adapt Open Source initiative. Select a menu option below to find out more.",
        "buttons": {
            "submit": "Submit",
            "reset": "Reset",
            "showCorrectAnswer": "Model Answer",
            "hideCorrectAnswer": "My Answer"
        },
        "_latestTrackingId": 13
    }, {reset:true});
    Adapt.contentObjects = new Backbone.Collection([
        {
            "_id": "co-05",
            "_parentId": "course",
            "_type": "page",
            "title": "Title of first page model"
        },
        {
            "_id": "co-10",
            "_parentId": "course",
            "_type": "menu",
            "title": "Title of second page model"
        },
        {
            "_id": "co-15",
            "_parentId": "co-10",
            "_type": "page",
            "title": "Title of third page model"
        },
        {
            "_id": "co-20",
            "_parentId": "course",
            "_type": "page",
            "title": "Title of fourth page model"
        }
    ], {model: ContentObjectModel, reset:true});
    Adapt.articles = new Backbone.Collection([
        {
            "_id": "a-05",
            "_parentId": "co-05",
            "_type": "article",
            "title": "Article first title"
        },
        {
            "_id": "a-10",
            "_parentId": "co-05",
            "_type": "article",
            "title": "Article second title"
        },
        {
            "_id": "a-15",
            "_parentId": "co-15",
            "_type": "article",
            "title": "Article third title"
        },
        {
            "_id": "a-20",
            "_parentId": "co-20",
            "_type": "article",
            "title": "Article fourth title"
        }
    ], {model: ArticleModel, reset:true});
    Adapt.blocks = new Backbone.Collection([
        {
            "_id": "b-05",
            "_parentId": "a-05",
            "_type": "block",
            "title": "Title of first block"
        },
        {
            "_id": "b-10",
            "_parentId": "a-05",
            "_type": "block",
            "title": "Title of second block"
        },
        {
            "_id": "b-15",
            "_parentId": "a-10",
            "_type": "block",
            "title": "Title of third block"
        },
        {
            "_id": "b-20",
            "_parentId": "a-15",
            "_type": "block",
            "title": "Title of fourth block"
        },
        {
            "_id": "b-25",
            "_parentId": "a-20",
            "_type": "block",
            "title": "Title of fifth block"
        }
    ], {model: BlockModel, reset:true});
    Adapt.components = new Backbone.Collection([
        {
            "_id": "c-05",
            "_parentId": "b-05",
            "_type": "component",
            "_component": "text",
            "_classes": "",
            "title": "Title of our very first component",
            "body": "Whoo - if we get this rendering we've made the big time"
        },
        {
            "_id": "c-10",
            "_parentId": "b-05",
            "_type": "component",
            "_component": "text",
            "_classes": "",
            "title": "Title of our very second component",
            "body": "Whoo - if we get this rendering we've made the big time"
        },
        {
            "_id": "c-15",
            "_parentId": "b-10",
            "_type": "component",
            "_component": "text",
            "_classes": "",
            "title": "Title of our very third component",
            "body": "Whoo - if we get this rendering we've made the big time"
        },
        {
            "_id": "c-20",
            "_parentId": "b-10",
            "_type": "component",
            "_component": "text",
            "_classes": "",
            "title": "Title of our very fourth component",
            "body": "Whoo - if we get this rendering we've made the big time"
        },
        {
            "_id": "c-25",
            "_parentId": "b-15",
            "_type": "component",
            "_component": "text",
            "_classes": "",
            "title": "Title of our very fifth component",
            "body": "Whoo - if we get this rendering we've made the big time"
        }
    ], {model: ComponentModel, reset:true});

    Adapt.trigger('app:dataReady');

    describe('AdaptModel', function () {

        it("should allow me to get my children if I'm a contentObject", function () {

            var firstContentObject = Adapt.contentObjects.models[0];
            var children = firstContentObject.getChildren();
            var firstChildTitle = children.models[0].get('title');
            expect(firstChildTitle).to.be('Article first title');

        });

        it("should allow me to search my children if I'm a contentObject to find my Articles", function () {

            var firstContentObject = Adapt.contentObjects.models[0];
            var children = firstContentObject.findDescendants('articles');
            var firstChildTitle = children.models[0].get('title');
            expect(firstChildTitle).to.be('Article first title');

        });

        it("should allow me to search my children if I'm a contentObject to find my Blocks", function () {

            var firstContentObject = Adapt.contentObjects.models[0];
            var children = firstContentObject.findDescendants('blocks');
            var firstChildTitle = children.models[0].get('title');
            expect(firstChildTitle).to.be('Title of first block');

        });

        it("should allow me to search my children if I'm a contentObject to find my Components", function () {

            var firstContentObject = Adapt.contentObjects.models[0];
            var children = firstContentObject.findDescendants('components');
            var firstChildTitle = children.models[0].get('title');
            expect(firstChildTitle).to.be('Title of our very first component');

        });

        it("should allow me to get my parent if I'm a contentObject but my parent is not the course model", function () {
            var contentObject = Adapt.contentObjects.findWhere({_id: 'co-15'});
            var parent = contentObject.getParent();
            expect(parent.get('title')).to.be('Title of second page model');
        });

        it("should allow me to get my parent if I'm an article", function () {

            var firstArticle = Adapt.articles.models[0];
            var parent = firstArticle.getParent();
            var parentTitle = parent.get('title');
            expect(parentTitle).to.be('Title of first page model');

        });

        it("should allow me to get my children if I'm an article", function () {

            var firstArticle = Adapt.articles.models[0];
            var children = firstArticle.getChildren();
            var lengthOfChildren = children.length;
            expect(lengthOfChildren).to.equal(2);

        });

        it("should allow me to search my children if I'm a article to find my blocks", function () {

            var firstArticle = Adapt.articles.models[0];
            var children = firstArticle.findDescendants('blocks');
            var firstChildTitle = children.models[0].get('title');
            expect(firstChildTitle).to.equal('Title of first block');

        });

        it("should allow me to search my children if I'm a article to find my components", function () {

            var firstArticle = Adapt.articles.models[0];
            var children = firstArticle.findDescendants('components');
            var firstChildTitle = children.models[0].get('title');
            expect(firstChildTitle).to.equal('Title of our very first component');

        });

        it("should allow me to search my parents if I'm a article to find my closest contentObject", function () {

            var firstArticle = Adapt.articles.models[0];
            var parent = firstArticle.findAncestor('contentObjects');
            var parentTitle = parent.get('title');
            expect(parentTitle).to.equal('Title of first page model');

        });

        it("should allow me to get my parent if I'm a block", function () {

            var firstBlock = Adapt.blocks.models[0];
            var parent = firstBlock.getParent();
            var parentId = parent.get('_id');
            expect(parentId).to.be('a-05');

        });

        it("should allow me to get my children if I'm an block", function () {

            var firstBlock = Adapt.blocks.models[0];
            var children = firstBlock.getChildren();
            var lengthOfChildren = children.length;
            expect(lengthOfChildren).to.equal(2);

        });

        it("should allow me to search my children if I'm a block to find my components", function () {

            var firstBlock = Adapt.blocks.models[0];
            var children = firstBlock.findDescendants('components');
            var firstChildTitle = children.models[0].get('title');
            expect(firstChildTitle).to.equal('Title of our very first component');

        });

        it("should allow me to search my parents if I'm a block to find my closest article", function () {

            var firstBlock = Adapt.blocks.models[0];
            var parent = firstBlock.findAncestor('articles');
            var parentTitle = parent.get('title');
            expect(parentTitle).to.equal('Article first title');

        });

        it("should allow me to search my parents if I'm a block to find my closest contentObject", function () {

            var firstBlock = Adapt.blocks.models[0];
            var parent = firstBlock.findAncestor('contentObjects');
            var parentId = parent.get('_id');
            expect(parentId).to.equal('co-05');

        });

        // Here please

        it("should allow me to get my parent if I'm a component", function () {

            var firstComponent = Adapt.components.models[0];
            var parent = firstComponent.getParent();
            var parentId = parent.get('_id');
            expect(parentId).to.be('b-05');

        });

        it("should allow me to search my parents if I'm a component to find my closest block", function () {

            var firstComponent = Adapt.components.models[0];
            var parent = firstComponent.findAncestor('blocks');
            var parentId = parent.get('_id');
            expect(parentId).to.equal('b-05');

        });

        it("should allow me to search my parents if I'm a component to find my closest block", function () {

            var firstComponent = Adapt.components.models[0];
            var parent = firstComponent.findAncestor('articles');
            var parentTitle = parent.get('title');
            expect(parentTitle).to.equal('Article first title');

        });

        it("should allow me to search my parents if I'm a component to find my closest contentObject", function () {

            var firstComponent = Adapt.components.models[0];
            var parent = firstComponent.findAncestor('contentObjects');
            var parentId = parent.get('_id');
            expect(parentId).to.equal('co-05');

        });

        it("should allow me to set my childrens attributes by passing in an object", function () {

            var firstPage = Adapt.contentObjects.models[0];
            firstPage.setOnChildren({_isReady: true});
            var firstComponent = Adapt.components.models[0];
            var completeStatus = firstComponent.get('_isReady');
            expect(completeStatus).to.equal(true);

        });

        it("should allow me to set my childrens attributes by passing in a string", function () {

            var firstPage = Adapt.contentObjects.models[0];
            firstPage.setOnChildren("_isAvailable", false, {pluginName: "pluginOne"});
            var firstComponent = Adapt.components.models[0];
            var availableStatus = firstComponent.get('_isAvailable');
            expect(availableStatus).to.equal(false);

        });

        it("should allow me to set my childrens attributes by passing in an object with options", function () {

            var isOptionalTriggered = false;
            Adapt.components.on('change:_isOptional', function (model) {
                isOptionalTriggered = true;
            })
            var firstPage = Adapt.contentObjects.models[0];
            firstPage.setOnChildren({_isOptional: true}, {pluginName: "pluginOne", silent: true});
            var firstComponent = Adapt.components.models[0];
            var optionalStatus = firstComponent.get('_isOptional');
            expect(isOptionalTriggered).to.equal(false);

        });

        it("should allow me to get my siblings if I'm an article but not return myself", function () {

            var firstArticle = Adapt.articles.models[0];
            var siblings = firstArticle.getSiblings();
            expect(siblings.length).to.equal(1);

        });

        it("should allow me to get my siblings if I'm an article but return myself", function () {

            var firstArticle = Adapt.articles.models[0];
            var siblings = firstArticle.getSiblings(true);
            expect(siblings.length).to.equal(2);

        });

        it("should allow me to get my siblings if I'm an article and not return myself", function () {

            var firstArticle = Adapt.articles.models[0];
            var siblings = firstArticle.getSiblings();
            expect(siblings.models[0].get("title")).to.equal("Article second title");

        });

        it("should allow me to get my siblings if I'm an article and return myself", function () {

            var firstArticle = Adapt.articles.models[0];
            var siblings = firstArticle.getSiblings(true);
            expect(siblings.models[0].get("title")).to.equal("Article first title");

        });

    });

});
