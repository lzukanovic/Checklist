// TODO: saving new items to array
// TODO: deleting checked items from array, but visually getting rid of them after some time
// TODO: saving array locally to client

// TODO: upgrade footer to animation when user clicks help FAB
// TODO: improve styling
// TODO: fix bullet move for single line with emoji
// TODO: remove new item input animation on page load

var items = (function () {
    
    var list = [];
    var $module, title, titleInput, itemList, items, inputs, newItemField, newInput, template;
    updateDOM();
    updateListeners();
    
    function newListItemActivity() {        
        if ($(this).is(":focus"))
            $(this.parentNode).addClass('active');
        else
            $(this.parentNode).removeClass('active');
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
        } else {
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
        itemList = $module.find('#item-list');
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
        var html = template({itemName: itemName});
        newItemField.before(html);
        updateDOM();

        title.off();
        titleInput.off();
        items.off();
        inputs.off();
        newInput.off();

        updateListeners();
    };

    function checkItem() {
        $(this).addClass('checked');
        $(this).off();
        return false;
    };

    function autoGrow(element) {
        element.style.height = "5px";
        element.style.height = (element.scrollHeight)+"px";
    };

    return {
        autoGrow: autoGrow
    }

})();