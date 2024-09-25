document.addEventListener('DOMContentLoaded', function () {
  const cart = [];
  const cartBtn = document.getElementById('cart-btn');
  const modal = document.getElementById('modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cartItemsContainer = document.getElementById('cart-itens');
  const cartCountSpan = document.getElementById('cart-count');
  const cartTotalSpan = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const successModal = document.getElementById('success-modal');
  const finalTotalSpan = document.getElementById('final-total');
  const closeSuccessModalBtn = document.getElementById('close-success-modal-btn');
  const cartCountFooter = document.getElementById('cart-count-footer');
  const paymentOptions = document.getElementById('payment-options');
  const statusTarja = document.getElementById('status-tarja');
  const workingHoursDisplay = document.getElementById('working-hours-display');

  // Horário de funcionamento
  const workingDays = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
  const openHour = 15; // 15:00
  const closeHour = 22; // 22:00

  // Função para verificar se a loja está aberta
  function isStoreOpen() {
      const now = new Date();
      const day = now.toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase();
      const hour = now.getHours();

      return workingDays.includes(day) && hour >= openHour && hour < closeHour;
  }

  // Função para verificar horário de funcionamento e exibir alerta
  function checkStatus() {
      if (isStoreOpen()) {
          statusTarja.classList.remove("bg-red-600");
          statusTarja.classList.add("bg-green-600");
          workingHoursDisplay.innerHTML = '<span class="bg-green-600 text-white px-4 py-1 rounded">Loja aberta</span>';
      } else {
          statusTarja.classList.remove("bg-green-600");
          statusTarja.classList.add("bg-red-600");
          workingHoursDisplay.innerHTML = '<span class="bg-red-600 text-white px-4 py-1 rounded">Seg á Dom - 15:00 às 22:00</span>';

          // Exibe alerta usando Toastify
          Toastify({
              text: "A loja está fechada. Volte mais tarde!",
              duration: 6000,
              gravity: "top",
              position: "right",
              stopOnFocus: true,
              style: {
                  background: "#ef4444",
              }
          }).showToast();
      }
  }

  checkStatus();
  setInterval(checkStatus, 60000); // Atualiza a cada minuto

  // Função para adicionar item ao carrinho
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', () => {
          const name = button.getAttribute('data-name');
          const price = parseFloat(button.getAttribute('data-price'));

          // Verifica se o item já está no carrinho
          const existingItem = cart.find(item => item.name === name);
          if (existingItem) {
              existingItem.quantity += 1; // Incrementa a quantidade
          } else {
              cart.push({ name, price, quantity: 1 }); // Adiciona novo item
          }
          updateCartDisplay();
      });
  });

  // Atualiza a exibição do carrinho
  function updateCartDisplay() {
      cartItemsContainer.innerHTML = '';
      cart.forEach((item, index) => {
          const li = document.createElement('li');
          li.innerHTML = `<span>${item.name} - R$ ${item.price.toFixed(2)} (x${item.quantity})</span>
              <button class="text-red-500 ml-2" onclick="removeFromCart(${index})">&times;</button>`;
          cartItemsContainer.appendChild(li);
      });
      const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      cartCountSpan.textContent = cart.length;
      cartTotalSpan.textContent = total.toFixed(2);
      cartCountFooter.textContent = cart.length;
  }

  // Remove item do carrinho
  window.removeFromCart = (index) => {
      cart.splice(index, 1);
      updateCartDisplay();
  };

  // Abre o modal do carrinho
  cartBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
  });

  // Fecha o modal do carrinho
  closeModalBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
  });

  // Finaliza o pedido
  checkoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      finalTotalSpan.textContent = total.toFixed(2);
      cart.length = 0; // Limpa o carrinho
      updateCartDisplay();
      successModal.classList.remove('hidden');
  });

  // Fecha o modal de sucesso
  closeSuccessModalBtn.addEventListener('click', () => {
      successModal.classList.add('hidden');
  });
});
