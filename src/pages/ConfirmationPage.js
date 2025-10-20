import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/ConfirmationPage.css";
// Импортируем изображения из src/assets — они будут включены в билд
import photoStep1 from '../assets/photo_confirmation_1.jpg';
import photoStep2 from '../assets/photo_confirmation_2.jpg';

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
    <div className="confirmation-page" style={{padding:20}}>
      <div className="confirmation-header" style={{marginBottom:20}}>
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

      <div className="confirmation-container" style={{background:'#fff', padding:20, borderRadius:8}}>
        <p style={{marginTop:0, marginBottom:12}}>
          Для использования сервиса нужно подтвердить ваш аккаунт WB. Для этого следуйте инструкции на изображениях.
        </p>

        {/* Инструкционные скриншоты — отдельные блоки с разделителем */}
        <div className="confirmation-steps" style={{marginBottom:12}}>
          <div className="step-box">
            <p className="step-title" style={{margin:0, fontWeight:600}}>Шаг 1</p>
            <img src={photoStep1} alt="Инструкция шаг 1" className="step-image" />
            <p className="step-desc" style={{marginTop:6, marginBottom:0, color:'#666'}}>Откройте настройки аккаунта WB и нажмите на "Данные и настройки".</p>
          </div>
          <div className="step-separator" aria-hidden="true"></div>
          <div className="step-box">
            <p className="step-title" style={{margin:0, fontWeight:600}}>Шаг 2</p>
            <img src={photoStep2} alt="Инструкция шаг 2" className="step-image" />
            <p className="step-desc" style={{marginTop:6, marginBottom:0, color:'#666'}}>Сделайте скрин данной страницы и загрузите его ниже.</p>
          </div>
        </div>

        {/* Подсказка под шагами
        <p className="steps-hint" style={{color:'#444', marginBottom:12}}>
          Снимите весь вид экрана с видимыми разделами, чтобы было видно подтверждение аккаунта (дату/статус). На скрине не должно быть обрезанных участков.
        </p> */}

        {/* Отдельно оформленная секция загрузки */}
        <div className="confirmation-upload-section">
          <p style={{marginBottom:6}}>Прикрепите скриншот подтверждения WB</p>
          <label className="upload-label" htmlFor="confirmation-upload" style={{display:'inline-block', cursor:'pointer'}}>
            {filePreview ? 'Скриншот выбран' : 'Выберите скриншот'}
          </label>
          <input
            id="confirmation-upload"
            type="file"
            accept="image/*"
            className="upload-input"
            onChange={handleFileChange}
          />
          {filePreview && (
            <div className="preview-wrapper">
              <p style={{margin:0, marginBottom:8}}>Превью загруженного скрина:</p>
              <img src={filePreview} alt="preview" style={{width:'100%', maxWidth:420, borderRadius:8}} />
            </div>
          )}

          <div className="actions-row">
            <button
              className="purchase-step-button small-button"
              onClick={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? 'Отпр...' : 'Отправить'}
            </button>
            <button
              className="telegram-button small-button"
              onClick={() => navigate('/profile')}
            >
              Назад
            </button>
          </div>

          {message && <p className="confirmation-message" style={{color: message.includes('Ошибка') ? 'red' : 'green'}}>{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
