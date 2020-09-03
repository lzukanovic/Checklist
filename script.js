// TODO: updating existing items in db
// TODO: deleting checked items from db, but visually getting rid of them after some time

// TODO: fix bullet move for single line with emoji

// TODO: upgrade scroll bar

// Create an instance of a db object for us to store the open database in
let db;

var items = (function () {
    
    var $module, title, titleInput, list, items, inputs, newItemField, newInput, template;
    updateDOM();
    updateListeners();

    function displayTitle() {
        let titleName = localStorage.getItem("titleName");
        $(title).find('div').html(titleName);
        titleInput.html(titleName);
    }

    function displayData() {
        // remove previous list items to avoid duplication
        items.slice(0, -1).remove();
        
        // query db to display the data
        let objectStore = db.transaction('items_os').objectStore('items_os');
        objectStore.openCursor().onsuccess = function(e) {
            let cursor = e.target.result;
            var html;
            
            if (cursor) {
                html = template({
                    itemName: cursor.value.itemName,
                    dataItemId: cursor.value.id
                });
                newItemField.before(html);
                cursor.continue();
            } else {
                // no more cursor items to iterate through
                // update DOM
                updateDOM();
                title.off();
                titleInput.off();
                items.off();
                inputs.off();
                newInput.off();
                updateListeners();
            }

        };
    };
    
    function newListItemActivity() {        
        if ($(this).is(":focus")) {
            $(this.parentNode).addClass('active');
            $(this.parentNode).removeClass('deactive');
        } else {
            $(this.parentNode).removeClass('active');
            $(this.parentNode).addClass('deactive');
        }
    };

    function edit() {
        $(this).off();
        $(this).addClass('edit');
        var input = $(this).find('textarea');
        input[0].focus();

        // place cursor at the end
        var tmp = input[0].value;
        input[0].value = '';
        input[0].value = tmp;
    };

    function save() {
        if (newInput[0].value) {
            addItem(newInput[0].value);
            newInput[0].value = "";
        } else if ($(this.parentElement).attr('id') == 'list-title') {
            // update item in localstorage
            localStorage.setItem("titleName", this.value);
            console.log('Localstorage update finished.');
            
            // update html
            this.previousElementSibling.innerHTML = this.value;
            $(this.parentElement).on('click', edit);
            $(this.parentElement).on('contextmenu', checkItem);
        }
        else {
            // update item in db
            let itemId = Number(this.parentElement.getAttribute('data-item-id'));
            let objectStore = db.transaction(["items_os"], "readwrite").objectStore("items_os");
            let requestUpdate = objectStore.put({itemName: this.value, id: itemId});
            
            requestUpdate.onerror = function(event) {
                console.log('Transaction not opened due to error');
            };
            requestUpdate.onsuccess = function(event) {
                console.log('Transaction completed: database update finished.');
            };

            // update html
            this.previousElementSibling.innerHTML = this.value;
            $(this.parentElement).on('click', edit);
            $(this.parentElement).on('contextmenu', checkItem);
        }

        $(this.parentNode).removeClass('edit');
    };

    function updateDOM() {
        $module = $('.content');
        title = $module.find('.list-title');
        titleInput = title.find('textarea');
        //list = $module.find('ul');
        items = $module.find('li');
        inputs = items.find('textarea');
        newItemField = $module.find('.new-li');
        newInput = newItemField.find('textarea');
        template = Handlebars.compile($module.find('#list-item-template').html());
    };

    function updateListeners() {
        title.on('click', edit);
        titleInput.on('blur', save);
        titleInput.on('keypress', function(e) {
            if (e.which === 13)
                save.call(this);
        });

        items.on('click', edit);
        items.slice(0, -1).on('contextmenu', checkItem); // handle right click event only on valid list elements

        inputs.on('blur', save);
        inputs.on('keypress', function(e) {
            if (e.which === 13)
                save.call(this);
        });

        newInput.on('focus', newListItemActivity);
        newInput.on('blur', newListItemActivity);
        newInput.on('keypress', function(e) {
            if (e.which === 13)
                newListItemActivity.call(this);
        });
    };

    function addItem(itemName) {
        // save to db
        let newItem = {itemName: itemName};
        let transaction = db.transaction(['items_os'], 'readwrite');
        let objectStore = transaction.objectStore('items_os');
        let request = objectStore.add(newItem);

        transaction.oncomplete = function() {
            console.log('Transaction completed: database addition finished.');
            displayData();
        };
    
        transaction.onerror = function() {
            console.log('Transaction not opened due to error');
        };
    };

    function checkItem() {
        let element = this;
        $(this).addClass('checked');
        $(this).off();

        let itemId = Number(this.getAttribute('data-item-id'));
        let transaction = db.transaction(['items_os'], 'readwrite');
        let objectStore = transaction.objectStore('items_os');
        let request = objectStore.delete(itemId);

        transaction.oncomplete = function() {
            
            setTimeout( () => {
                $(element).remove();
                console.log('Item ' + itemId + ' deleted.');
            }, 2000);
        };

        return false;
    };

    function autoGrow(element) {
        element.style.height = "5px";
        element.style.height = (element.scrollHeight)+"px";
    };

    return {
        autoGrow: autoGrow,
        displayData: displayData,
        displayTitle: displayTitle
    }

})();


$(window).on('load', function () {

    // Save inital title value to localstorage
    if (typeof(Storage) !== "undefined") {
        if ("titleName" in localStorage) {
            items.displayTitle();
        } else {
            localStorage.setItem("titleName", "List Title 📋");
        }
    } else {
        console.log("Browser doesn’t support local storage!");  
    }

    // Open the database
    let request = window.indexedDB.open('items_db', 1);

    request.onerror = function() {
        console.log('Database failed to open');
    };
    
    request.onsuccess = function() {
        console.log('Database opened successfully');
    
        db = request.result;
    
        items.displayData();
    };

    // Setup the DB
    request.onupgradeneeded = function(e) {
        // Grab a reference to the opened database
        let db = e.target.result;
    
        // Create an objectStore to store our notes in (basically like a single table)
        let objectStore = db.createObjectStore('items_os', { keyPath: 'id', autoIncrement:true });
    
        // Define what data items the objectStore will contain
        objectStore.createIndex('itemName', 'itemName', { unique: false });

        // Add starting values
        objectStore.transaction.oncomplete = function(event) {

            var itemsObjectStore = db.transaction("items_os", "readwrite").objectStore("items_os");
            
            //itemsObjectStore.add({itemName: "List Title 📋"});
            itemsObjectStore.add({itemName: "Left click to edit items 🚧"});
            itemsObjectStore.add({itemName: "Click somewhere else or press enter to save."});
            itemsObjectStore.add({itemName: "Right click (or long press if on mobile) to mark item as done 👈"});
        };
    
        console.log('Database setup complete');
    };
});


/*
*   Handles footer help menu
*/
$("#myButton").click(function(){
    var icon = this.children[0];

    if ($("#myFooter").is(":visible")) {
        $("#myFooter").slideUp(500);
        // ?
        $(icon).removeClass('fa-times');
        $(icon).addClass('fa-question');
        
    } else {
        $("#myFooter").slideDown(500);
        // x
        $(icon).removeClass('fa-question');
        $(icon).addClass('fa-times');
    }

});