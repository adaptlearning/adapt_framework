cy.helpers = {
  stripHtml(text) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = text;
    const textWithoutHtml = tmp.textContent || tmp.innerText || '';
    return textWithoutHtml;
  }
};
