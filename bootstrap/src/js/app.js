const shuffle = (arr) => {
  let j;
  let temp;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = arr[j];
    arr[j] = arr[i];
    arr[i] = temp;
  }
  return arr;
};

function mixListItems(listElement) {
  shuffle([...listElement.children]).forEach((el) => listElement.append(el));
}

document
  .querySelector('[data-element="mixListBtn"]')
  .addEventListener('click', () => {
    const cards = document.querySelector('[data-element="list"]');

    mixListItems(cards);
  });
