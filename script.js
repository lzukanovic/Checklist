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
                if(cursor.value.itemName != '') {
                    html = template({
                        itemName: cursor.value.itemName,
                        dataItemId: cursor.value.id
                    });
                    newItemField.before(html);
                }
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
        items = $module.find('li');
        inputs = items.find('textarea');
        newItemField = $module.find('.new-li');
        newInput = newItemField.find('textarea');
        template = Handlebars.compile($module.find('#list-item-template').html());
    };

    function updateListeners() {
        let touchstartX = 0;
        let touchstartY = 0;
        let touchendX = 0;
        let touchendY = 0;

        title.on('click', edit);
        titleInput.on('blur', save);
        titleInput.on('keypress', function(e) {
            if (e.which === 13)
                save.call(this);
        });

        items.on('click', edit);
        let checkables = items.slice(0, -1);
        if (mobileCheck) {
            for (var i = 0; i < checkables.length; i++) {
                checkables[i].addEventListener('touchstart', function(event) {
                    touchstartX = event.changedTouches[0].screenX;
                    touchstartY = event.changedTouches[0].screenY;
                }, false);
    
                checkables[i].addEventListener('touchend', function(event) {
                    touchendX = event.changedTouches[0].screenX;
                    touchendY = event.changedTouches[0].screenY;
                    // Right swipe
                    if (touchendX >= touchstartX) {
                        checkItem.call(this);
                    }
                }, false); 
            }
        }
        else {
            checkables.on('contextmenu', checkItem);
        }


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

    function mobileCheck() {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
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
            items.displayTitle();
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