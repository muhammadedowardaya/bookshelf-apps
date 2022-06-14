const books = [];
const RENDER_EVENT = 'render-book';

const myAlert = {
    show: function (title, message) {
        const alertBtnYes = document.querySelector('.action-alert button.yes');
        const alertBtnNo = document.querySelector('.action-alert button.no');
        alertBtnYes.classList.remove('show');
        alertBtnNo.classList.remove('show');

        const alertContainer = document.querySelector('.alert');
        alertContainer.classList.add('show');
        const alertTitle = document.querySelector('.alert h1');
        alertTitle.innerText = title;
        const alertMessage = document.querySelector('.alert p');
        alertMessage.innerText = message;

        const alertBtnOk = document.querySelector('.action-alert button.ok');
        alertBtnOk.classList.add('show');

        alertBtnOk.addEventListener('click', function () {
            alertContainer.classList.remove('show');
        })
    },
    confirmDelete: function (id, title, message) {
        const alertBtnOk = document.querySelector('.action-alert button.ok');
        alertBtnOk.classList.remove('show');

        const alertContainer = document.querySelector('.alert');
        alertContainer.classList.add('show');
        const alertTitle = document.querySelector('.alert h1');
        alertTitle.innerText = title;
        const alertMessage = document.querySelector('.alert p');
        alertMessage.innerText = message;

        const alertBtnYes = document.querySelector('.action-alert button.yes');
        alertBtnYes.classList.add('show');
        alertBtnYes.addEventListener('click', function () {
            removeBook(id);
            myAlert.show('Info', 'Berhasil dihapus!');
        })
        const alertBtnNo = document.querySelector('.action-alert button.no');
        alertBtnNo.classList.add('show');
        alertBtnNo.addEventListener('click', function () {
            alertContainer.classList.remove('show');
        })
    }
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function findBook(bookId) {
    for (bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}



function makebook(bookObject) {
    const {
        id,
        title,
        author,
        year,
        isCompleted
    } = bookObject;

    const textTitle = document.createElement('h3');
    textTitle.innerText = title;

    const textauthor = document.createElement('p');
    textauthor.innerText = `Penulis : ${author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun : ${year}`;

    const action = document.createElement('div');
    action.classList.add('action');

    const article = document.createElement('article');
    article.classList.add('book_item');
    article.append(textTitle, textauthor, textYear, action);
    article.setAttribute('id', `book-${id}`);

    if (isCompleted) {
        const unreadButton = document.createElement('button');
        unreadButton.classList.add('unread-button');
        unreadButton.innerText = "Belum selesai dibaca";
        unreadButton.addEventListener('click', function () {
            undoBookFromCompleted(id);
            myAlert.show('Info!', `Berhasil menjadikan ${title} sebagai belum selesai dibaca`);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.innerText = "Hapus";
        trashButton.addEventListener('click', function () {
            myAlert.confirmDelete(id, 'Perhatian!', `Yakin ingin menghapus ${title}?`);
        });

        action.append(unreadButton, trashButton);

    } else {
        const completedButton = document.createElement('button');
        completedButton.classList.add('completed-button');
        completedButton.innerText = "Selesai dibaca";
        completedButton.addEventListener('click', function () {
            addBookToCompleted(id);
            myAlert.show('Info!', `Berhasil menjadikan ${title} sebagai selesai dibaca`);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.innerText = "Hapus";
        trashButton.addEventListener('click', function () {
            myAlert.confirmDelete(id, 'Perhatian!', `Yakin ingin menghapus ${title}?`);
        });

        action.append(completedButton, trashButton);
    }

    return article;
}

function addbook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;
    let IsComplete = document.querySelector('#inputBookIsComplete:checked');

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, year, IsComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    myAlert.show('Berhasil!', `Berhasil menambahkan buku ${title}`);
    document.getElementById('inputBook').reset();
}

function addBookToCompleted(bookId /* HTMLELement */ ) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData(bookTarget, 'berhasil ditambahkan ke list selesai');
}

function removeBook(bookId /* HTMLELement */ ) {
    const bookTarget = findBookIndex(bookId);
    if (bookTarget === -1) return;
    books.splice(bookTarget, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData(bookTarget, 'berhasil dihapus');
}

function undoBookFromCompleted(bookId /* HTMLELement */ ) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData(bookTarget, 'berhasil diundo');
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm /* HTMLFormElement */ = document.getElementById('inputBook');

    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addbook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});


document.addEventListener(RENDER_EVENT, function () {
    const uncompletedbookList = document.getElementById('uncompleteBookshelfList');
    const completeBookshelfList = document.getElementById('completeBookshelfList');

    // clearing list item
    uncompletedbookList.innerHTML = '';
    completeBookshelfList.innerHTML = '';

    const searchTitle = document.getElementById('searchBookTitle').value.toLowerCase();

    for (bookItem of books) {
        const bookElement = makebook(bookItem);
        if (bookItem.title.toLowerCase().includes(searchTitle)) {
            if (bookItem.isCompleted) {
                completeBookshelfList.append(bookElement);
            } else {
                uncompletedbookList.append(bookElement);
            }
        }
    }
});


function saveData() {

    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() /* boolean */ {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.getElementById('searchBookTitle').onkeyup = function () {
    document.dispatchEvent(new Event(RENDER_EVENT));
}