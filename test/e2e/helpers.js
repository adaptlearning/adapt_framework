cy.helpers = {
    stripHtml(text) {
      let tmp = document.createElement("DIV");
      tmp.innerHTML = text;
      const textWithoutHtml = tmp.textContent || tmp.innerText || "";
      return textWithoutHtml
    }
  }