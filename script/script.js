document.addEventListener('DOMContentLoaded', () => {

    const cartBtn = document.getElementById('cart'),
          wishlistBtn = document.getElementById('wishlist'),
          search = document.querySelector('.search'),
          goodsWrapper =  document.querySelector('.goods-wrapper'),
          cart = document.querySelector('.cart'),
          category = document.querySelector('.category'),
          cartCounter = cartBtn.querySelector('.counter'),
          wishListCounter = wishlistBtn.querySelector('.counter'),
          cartWrapper = document.querySelector('.cart-wrapper');
          

    const wishlist = [];
    const  goodsBasket = {};

    // Спиннер
    const loading = (nameFunction) => {
        const spinner = `<div id="spinner"><div class="spinner-loading"><div>
        <div><div></div></div><div><div></div></div><div><div>
        </div></div><div><div></div></div></div></div></div>`

        if (nameFunction === 'renderCard') {
            goodsWrapper.innerHTML = spinner;
        }
        if (nameFunction === 'renderBasket') {
            cartWrapper.innerHTML = spinner;
        }
    };

    // Запрос на сервер
    const getGoods = (handler, filter) => {
        loading(handler.name);
        fetch('db/db.json')
            .then(response => response.json())
            .then(filter)
            .then(handler);
    };

    // Генерация карточек на странице
    const createCardGoods = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'card-wrapper col-12 col-md-6 col-lg-4 col-xl-3 pb-3';
        card.innerHTML = `
                            <div class="card">
                                <div class="card-img-wrapper">
                                    <img class="card-img-top" src="${img}" alt="">
                                    <button class="card-add-wishlist ${wishlist.includes(id) ? 'active' : ''}" 
                                        data-goods-id="${id}"></button>
                                </div>
                                <div class="card-body justify-content-between">
                                    <a href="#" class="card-title">${title}</a>
                                    <div class="card-price">${price} ₽</div>
                                    <div>
                                        <button class="card-add-cart" data-goods-id="${id}">Добавить в корзину</button>
                                    </div>
                                </div>
                            </div>
                        `
        return card;
    };

    // Генерация карточек в корзине
    const createCardGoodsBasket = (id, title, price, img) => {
        const card = document.createElement('div');
        card.className = 'goods';
        card.innerHTML = `
                        <div class="goods-img-wrapper">
                            <img class="goods-img" src="${img}" alt="">

                        </div>
                        <div class="goods-description">
                            <h2 class="goods-title">${title}</h2>
                            <p class="goods-price">${price} ₽</p>
                        </div>
                        <div class="goods-price-count">
                            <div class="goods-trigger">
                                <button class="goods-add-wishlist ${wishlist.includes(id) ? 'active' : ''}"
                                    data-goods-id="${id}"></button>
                                <button class="goods-delete ${wishlist.includes(id) ? 'active' : ''}"
                                    data-goods-id="${id}"></button>
                        </div>
                            <div class="goods-count">${goodsBasket[id]}</div>
                        </div>
                        `
        return card;
    };

    // Рендеры карточек на странице
    const renderCard = goods => {
        goodsWrapper.textContent = '';
        if (goods.length) {
            goods.forEach(({ id, title, price, imgMin }) => {
                goodsWrapper.append(createCardGoods(id, title, price, imgMin));
                
            });
        } else {
            goodsWrapper.textContent = '❌ Нет товаров по вашему поиску';
        }
        
        
    };
    
    // Рендеры карточек в корзине
    const renderBasket = goods => {
        cartWrapper.textContent = '';
        if (goods.length) {
            goods.forEach(({ id, title, price, imgMin }) => {
                cartWrapper.append(createCardGoodsBasket(id, title, price, imgMin));
            });
        } else {
            cartWrapper.innerHTML = '<div id="cart-empty">Ваша корзина пока пуста</div>';
        }      
    };

    // Калькулятор стоимости товаров в корзине
    const calcTotalPrice = goods => {
        let sum = goods.reduce((accum, item) => {
            return accum + item.price * goodsBasket[item.id];
        }, 0);

        cart.querySelector('.cart-total>span').textContent = sum.toFixed(2);
    };

    // Счетчик количества товаров в корзине и избранном
    const checkCount = () => {
        wishListCounter.textContent = wishlist.length;
        cartCounter.textContent = Object.keys(goodsBasket).length;
    };

    // Фильтрация карточек в корзине
    const showCardBasket = goods => {
        const basketGoods = goods.filter(item => goodsBasket.hasOwnProperty(item.id));
        calcTotalPrice(basketGoods);
        return basketGoods;
    };

    // Фильтрация карточек в Избранном
    const showWishlist = () => {
        getGoods(renderCard, goods => goods.filter(item => wishlist.includes(item.id)));
    };

    // Рандомная сортировка товаров на странице
    const randomSort = (item) => item.sort(() => Math.random() - 0.5);

    // Работа с хранилищами 
    // 1) Получение куки
    const getCookie = (name) => {
        let matches = document.cookie.match(new RegExp(
          "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    // 2) Сохрание товаров из корзины в куки и хранение их там одни сутки
    const cookieQuery = get => {
        if (get) {
            if (getCookie('goodsBasket')) {
                Object.assign(goodsBasket, JSON.parse(getCookie('goodsBasket')));
            }
            checkCount();
        } else {
            document.cookie = `goodsBasket=${JSON.stringify(goodsBasket)};max-age=86400e3`;
        }
    };

    // 3) Сохранение товаров в Local Storage из избранного
    const storageQuery = get => {
        if (get) {
            if (localStorage.getItem('wishlist')) {
                wishlist.push(...JSON.parse(localStorage.getItem('wishlist')))
            }
            checkCount();
        } else {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
        
    };

    // Закрыть корзину
    const closeCart = event => {
        const target = event.target;
        const keyCode = event.keyCode;
        if (target === cart || target.classList.contains('cart-close') || keyCode == 27){
            cart.style.display = '';
            document.removeEventListener('keydown', closeCart);
        }
        
    };

    // Открыть корзину
    const openCart = (event) => {
        event.preventDefault();
        cart.style.display = 'flex';
        document.addEventListener('keydown', closeCart);
        getGoods(renderBasket, showCardBasket);
    };

    // Выбор категории товаров и их фильтрация
    const chooseCategory = event => {
        event.preventDefault;
        const target = event.target;

        if (target.classList.contains('category-item')) {
            const category = target.dataset.category;
            getGoods(renderCard, goods => goods.filter(item => item.category.includes(category)))
        };
    };

    // Поиск товаров на странице
    const searchGoods = event => {
        event.preventDefault();

        const input = event.target.elements.searchGoods;
        // trim() убирает пробелы
        const inputValue = input.value.trim();
        // ищем если не пустая строка

        if (inputValue !== ''){
            const searchString = new RegExp(inputValue, 'i');
            getGoods(renderCard, goods => goods.filter(item => searchString.test(item.title)));
        } else {
            search.classList.add('error');
            setTimeout(() => {
                search.classList.remove('error');
            }, 2000)
        }
        input.value = "";
    };

    // Нажатие на иконку "Добавить в Избранное"
    const toggleWishlist = (id, elem) => {
        if (wishlist.includes(id)) {
            wishlist.splice(wishlist.indexOf(id), 1);
            elem.classList.remove('active');
        }else {
            wishlist.push(id);
            elem.classList.add('active');
        }
        checkCount();
        storageQuery();
    };

    // Добавить товар в корзину
    const addBasket = (id) => {
        if (goodsBasket[id]) {
            goodsBasket[id] += 1;
        } else {
            goodsBasket[id] = 1;
            
        }
        checkCount();
        cookieQuery();
    };

    // Удалить из корзины
    const removeGoods = id => {
        delete goodsBasket[id];
        checkCount();
        cookieQuery();
        getGoods(renderBasket, showCardBasket);
    };

    // Определение клика на "Добавить в Избанное" и "Добавить в корзину" на странице
    const handlerGoods = event => {
        const target = event.target;
        if (target.classList.contains('card-add-wishlist')){
            toggleWishlist(target.dataset.goodsId, target);
        };
        if (target.classList.contains('card-add-cart')) {
            addBasket(target.dataset.goodsId);
        };
    };

    
    // Определение клика на "Добавить в избранное" и "Удалить из корзины" в корзине
    const handlerBasket = () => {
        const target = event.target;
        if (target.classList.contains('goods-add-wishlist')){
            toggleWishlist(target.dataset.goodsId, target);
        }
        if (target.classList.contains('goods-delete')) {
            removeGoods(target.dataset.goodsId);
        }
    };

    getGoods(renderCard, randomSort);
    storageQuery('get');
    cookieQuery('get');

    cartBtn.addEventListener('click', openCart);
    cart.addEventListener('click', closeCart);
    search.addEventListener('submit', searchGoods);
    category.addEventListener('click', chooseCategory);
    goodsWrapper.addEventListener('click', handlerGoods);
    wishlistBtn.addEventListener('click', showWishlist);
    cartWrapper.addEventListener('click', handlerBasket); 

});