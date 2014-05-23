exports.command = function () {
    return this.url("http://localhost:9001/main.html")
               .waitForElementVisible('body', 5000)
               .frame(0)
               .waitForElementVisible('.menu', 10000);
};