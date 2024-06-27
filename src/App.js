import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage';
import CatalogPageModerate from './pages/CatalogPageModerate';
import AddProductPage from './pages/AddProductPage';
import PurchasesPage from './pages/PurchasesPage';
import ProfilePage from './pages/ProfilePage';
import ProductDetail from './components/ProductDetail';
import PurchaseStepsPage from './pages/PurchaseStepsPage';
import Sidebar from './components/Sidebar';
import './index.css';
 

  const App = () => {
    const [products, setProducts] = useState([]);

   /*   const [products, setProducts] = useState([
     {
       id: 1,
       image: "/Canada.jpg" ,
       name: 'Часы н1231аручные и Гелик 33ару33ару33ару33ару',
       description: 'Часы наручные 33ару33ару33ару33ару33ару33ару',
       terms: 'Оплата в течение 3-5 дней после публикации отзыва 33ару33ару33арувавававава   вававава   33ару',
       availableday: '15',
       marketprice: 1500000000000,
       yourprice: 130000000,
       discount: 1500000000000,
       step: "6",
       keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
       article: "123456",
     category: "Женщинам"
     },
     {
     id: 2,
       image: 'path_t211232o_image',
       name: 'Часы наручны2222е',
       description: 'Часы наручные',
       terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
       availableDay: 'Today',
       marketPrice: 1500,
       yourPrice: 1300,
       discount: 15,
     step: "Завершено",
       isComplete: true,
       keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
       article: "123456",
       category: "Мужчи1223123нам"
     },
     {
      id: 2,
        image: 'path_t211232o_image',
        name: 'Часы наручны2222е',
        description: 'Часы наручные',
        terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
        availableDay: 'Today',
        marketPrice: 1500,
        yourPrice: 1300,
        discount: 15,
      step: "Завершено",
        isComplete: true,
        keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
        article: "123456",
        category: "Мужч123123123инам"
      },
      {
        id: 2,
          image: 'path_t211232o_image',
          name: 'Часы наручны2222е',
          description: 'Часы наручные',
          terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
          availableDay: 'Today',
          marketPrice: 1500,
          yourPrice: 1300,
          discount: 15,
        step: "Завершено",
          isComplete: true,
          keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
          article: "123456",
          category: "Мужч12312312инам"
        },
        {
          id: 2,
            image: 'path_t211232o_image',
            name: 'Часы наручны2222е',
            description: 'Часы наручные',
            terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
            availableDay: 'Today',
            marketPrice: 1500,
            yourPrice: 1300,
            discount: 15,
          step: "Завершено",
            isComplete: true,
            keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
            article: "123456",
            category: "Мужчинам"
          },
          {
            id: 2,
              image: 'path_t211232o_image',
              name: 'Часы наручны2222е',
              description: 'Часы наручные',
              terms: 'Оплата в течение 3222-54444 дней после публикации отзыва',
              availableDay: 'Today',
              marketPrice: 1500,
              yourPrice: 1300,
              discount: 15,
            step: "Завершено",
              isComplete: true,
              keywords: "Диффузор для дома, Диффузоры РФ, Домашний ремонт окон и всего возможного",
              article: "123456",
              category: "Мужчинам"
            },
                        

   ]);  */
    const categories = ['Женщинам', 'Мужчинам', 'Обувь', 'Детям', 'Дом', 'Новый год'];
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const baseURL = 'https://nilurl.ru:8000/';
  
    const API = {
      async getUser(id) {
        try {
          const option = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          };
          const res = await fetch(`${baseURL}getUser.php?id=${id}`, option).then(res => res.json());
          return res;
        } catch (err) {
          console.log(err);
        }
      },
      async createUser(id, username) {
        try {
          const option = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id, username: username }),
          };
          const res = await fetch(`${baseURL}createUser.php`, option).then(res => res.json());
          return res;
        } catch (err) {
          console.log(err);
        }
      },
      async getProducts() {
        try {
          const option = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          };
          const res = await fetch(`${baseURL}getProducts.php`, option).then(res => res.json());
          return res;
        } catch (err) {
          console.log(err);
        }
      },
    };
  
    const fetchProducts = async () => {
      try {
        const response = await API.getProducts();
        if (response.success) {
          // Прошла успешная загрузка продуктов
          setProducts(response.data); // Устанавливаем продукты в состояние компонента
        } else {
          console.error('Failed to fetch products:', response.error);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
  
    useEffect(() => {
      window.Telegram.WebApp.expand();
  
      const fetchData = async () => {
        try {
          const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
          const username = window.Telegram.WebApp.initDataUnsafe.user.username;
          const response = await API.getUser(userId);
          if (!response.success) {
            const createResponse = await API.createUser(userId, username);
            if (createResponse.success === true) {
              const newUserResponse = await API.getUser(userId);
              setUserInfo(newUserResponse.data);
              fetchProducts();
              setIsLoading(false);
            }
          } else {
            setUserInfo(response.data);
            fetchProducts();
            setIsLoading(false);
          }
        } catch (e) {
          console.log(e);
        }
      };
  
      fetchData();
    }, []);
  
    if (isLoading) {
      return <div>Загрузка...</div>;
    }  
  
    const handleStepComplete = (step, formData) => {
      // Логика для обработки завершения шага
    };
  
    return (
      <Router>
        <div className="app-container">
          <Sidebar />
          <div className="content">
            <Routes>
              <Route exact path="/" element={<CatalogPage products={products} categories={categories} />} />
              <Route path="/catalog" element={<CatalogPage products={products} categories={categories}/>} />
              <Route path="/catalog-moderate" element={<CatalogPageModerate products={products} />} />
              <Route path="/add-product" element={<AddProductPage fetchProducts={fetchProducts} products={products} setProducts={setProducts} categories={categories} />} />
              <Route path="/purchases" element={<PurchasesPage products={products} userInfo={userInfo} />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/product/:id" element={<ProductDetail products={products} />} />
              <Route path="/purchase-steps/:id" element={<PurchaseStepsPage products={products} onStepComplete={handleStepComplete} />} />
            </Routes>
          </div>
        </div>
      </Router>
    );
  };
  
  export default App;
