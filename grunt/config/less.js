module.exports = {
    options:{
        compress:true
    },
    dist: {
        files: {
            '<%= outputdir %>adapt/css/adapt.css' : '<%= sourcedir %>less/adapt.less'
        }
    }
}
