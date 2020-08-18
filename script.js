// TODO: saving new items to array
// TODO: deleting checked items from array, but visually getting rid of them after some time
// TODO: saving array locally to client
// TODO: upgrade footer to animation when user clicks help FAB
// TODO: improve styling
// TODO: breakpoint for long words

var items = (function () {
    
    var list = [];
    var $module, title, titleInput, itemList, items, inputs, newItemField, newInput, template;
    updateDOM();
    updateListeners();
    
    function newListItemActivity() {
        $(this.parentNode).toggleClass('active');
    }

    function edit() {
        $(this).addClass('edit');
        var input = $(this).find('input');
        input[0].focus(); // set input focus
        // input[0].setSelectionRange(0, input[0].value.length); // select whole input text
        // place cursor at the end
        var tmp = input[0].value;
        input[0].value = '';
        input[0].value = tmp;
    };

    function save() {
        if (newInput[0].value) {
            //console.log("adding new item");
            addItem(newInput[0].value);
            newInput[0].value = "";
        } else {
            // console.log("saving input to span");
            this.previousElementSibling.innerHTML = this.value;
        }
        $(this.parentNode).removeClass('edit');
    };

    function updateDOM() {
        $module = $('.content');
        title = $module.find('.list-title');
        titleInput = title.find('input');
        itemList = $module.find('#item-list');
        items = $module.find('li');
        inputs = items.find('input');
        newItemField = $module.find('.new-li');
        newInput = newItemField.find('input');
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
        items.slice(0, -1).on('contextmenu', checkItem);

        inputs.on('blur', save);
        inputs.on('keypress', function(e) {
            if (e.which === 13)
                save.call(this);
        });

        newInput.on('focus', newListItemActivity);
        newInput.on('blur', newListItemActivity);
    }

    function addItem(itemName) {
        var html = template({itemName: itemName});
        newItemField.before(html);
        updateDOM();
        updateListeners();
    };

    function checkItem() {
        $(this).addClass('checked');
        $(this).off();
        return false;
    };

    return {
        addItem: addItem,
        checkItem: checkItem
    }
})();