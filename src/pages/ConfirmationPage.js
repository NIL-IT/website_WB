import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/ProfilePage.css";

const ConfirmationPage = ({ userInfo }) => {
  const navigate = useNavigate();
  const baseURL = "https://inhomeka.online:8000/";
  const [filePreview, setFilePreview] = useState(null);
  const [fileDataUrl, setFileDataUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileDataUrl(reader.result);
      setFilePreview(reader.result);
      setMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!userInfo || !userInfo.id_usertg) {
      setMessage('Ошибка: данные пользователя не загружены.');
      return;
    }
    if (!fileDataUrl) {
      setMessage('Пожалуйста, прикрепите скриншот.');
      return;
    }
    setIsUploading(true);
    setMessage(null);

    try {
      const fd = new FormData();
      fd.append('id_usertg', userInfo.id_usertg);
      fd.append('screenshot', fileDataUrl);

      const res = await fetch(`${baseURL}confirmAccount.php`, {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();
      if (json.success) {
        setMessage('Отправлено. Ожидайте подтверждения. Страница будет обновлена.');
        // краткая пауза, затем перезагрузка для обновления userInfo
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage(json.error || 'Ошибка на сервере при отправке.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Ошибка сети при отправке. Попробуйте ещё раз.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="profile-page" style={{padding:20}}>
      <div className="profile-header" style={{marginBottom:20}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <h2 style={{margin:0}}>Подтверждение аккаунта</h2>
          <span style={{
            width:14,
            height:14,
            borderRadius:14,
            backgroundColor: userInfo && userInfo.confirmation ? '#04B800' : '#FF3B30'
          }} />
        </div>
      </div>

      <div style={{background:'#fff', padding:20, borderRadius:8}}>
        <p style={{marginTop:0, marginBottom:12}}>
          Для использования сервиса нужно подтвердить ваш аккаунт WB. Для этого следуйте инструкции на изображениях.
        </p>

        {/* Инструкционные скриншоты (замените пути на реальные файлы/ресурсы при необходимости) */}
        <div style={{display:'flex', flexDirection:'column', gap:12, marginBottom:12}}>
          <div>
            <p style={{margin:0, fontWeight:600}}>Шаг 1</p>
            <img
              src="/assets/photo_confirmation_1.jpg"
              alt="Инструкция шаг 1"
              style={{width:'100%', maxWidth:420, borderRadius:8, marginTop:8, background:'#f0f0f0'}}
            />
            <p style={{marginTop:6, marginBottom:0, color:'#666'}}>Откройте настройки аккаунта WB и нажмите на "Данные и настройки".</p>
          </div>
          <div>
            <p style={{margin:0, fontWeight:600}}>Шаг 2</p>
            <img
              src="/assets/photo_confirmation_2.jpg"
              alt="Инструкция шаг 2"
              style={{width:'100%', maxWidth:420, borderRadius:8, marginTop:8, background:'#f0f0f0'}}
            />
            <p style={{marginTop:6, marginBottom:0, color:'#666'}}>Сделайте скрин данной страницы и загрузите его ниже.</p>
          </div>
        </div>

        {/* Поле для загрузки скриншота и кнопка отправки */}
        <div style={{marginTop:12}}>
          <p style={{marginBottom:6}}>Прикрепите скриншот подтверждения WB</p>
          <label className="upload-label" htmlFor="confirmation-upload" style={{display:'inline-block', width:'auto'}}>
            {filePreview ? 'Скриншот выбран' : 'Выберите скриншот'}
          </label>
          <input
            id="confirmation-upload"
            type="file"
            accept="image/*"
            className="upload-input"
            onChange={handleFileChange}
            style={{display:'block', marginTop:8}}
          />
          {filePreview && (
            <div style={{marginTop:12}}>
              <p style={{margin:0, marginBottom:8}}>Превью загруженного скрина:</p>
              <img src={filePreview} alt="preview" style={{width:'100%', maxWidth:420, borderRadius:8}} />
            </div>
          )}

          <div style={{display:'flex', gap:10, marginTop:16}}>
            <button
              className="purchase-step-button"
              onClick={handleSubmit}
              disabled={isUploading}
              style={{width:160}}
            >
              {isUploading ? 'Отправка...' : 'Отправить скриншот'}
            </button>
            <button
              className="telegram-button"
              onClick={() => navigate('/profile')}
              style={{width:120, background:'#ddd', color:'#000'}}
            >
              Назад
            </button>
          </div>

          {message && <p style={{marginTop:12, color: message.includes('Ошибка') ? 'red' : 'green'}}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
