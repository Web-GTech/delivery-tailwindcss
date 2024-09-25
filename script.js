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
  const closeSuccessModal = document.getElementById('close-success-modal');
  const closeSuccessModalBtn = document.getElementById('close-success-modal-btn');
  const cartCountFooter = document.getElementById('cart-count-footer');
  const paymentOptions = document.getElementById('payment-options');
  const statusTarja = document.getElementById('status-tarja');
  const addressForm = document.getElementById('checkout-form');

  // MODAL DE ALERTA
  const alertModal = document.getElementById('alert-modal');
  const alertMessage = document.getElementById('alert-message');
  const closeAlertModalBtn = document.getElementById('close-alert-modal-btn');
  const alertOkBtn = document.getElementById('alert-ok-btn');

  // Horário de funcionamento
  const workingDays = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
  const openHour = 18; // 18:00
  const closeHour = 24; // 24:00 (meia-noite)

  // Função para verificar se a loja está aberta
  function isStoreOpen() {
    const now = new Date();
    const day = now.toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase();
    const hour = now.getHours();
    const minutes = now.getMinutes();

    // Verifica se está dentro do horário de operação
    if (workingDays.includes(day)) {
      if (hour >= openHour && hour < closeHour) {
        return true; // Está aberta
      } else if (hour === closeHour && minutes === 0) {
        return true; // Exatamente na hora de fechamento
      }
    }
    return false; // Fora do horário de funcionamento
  }

  // Função para verificar horário de funcionamento e exibir alerta
  function checkStatus() {
    if (isStoreOpen()) {
      statusTarja.classList.remove("bg-red-500", "p-2", "mx-4", "rounded-lg");
      statusTarja.classList.add("bg-green-600", "p-2", "mx-4", "rounded-lg");
    } else {
      statusTarja.classList.remove("bg-green-600", "p-2", "mx-4", "rounded-lg");
      statusTarja.classList.add("bg-red-500", "p-2", "mx-4", "rounded-lg");

      // Exibe alerta de loja fechada
      Toastify({
        text: "A loja está fechada. Volte mais tarde!",
        duration: 6000,
        gravity: "top", // `top` ou `bottom`
        position: "right", // `left`, `center`, ou `right`
        stopOnFocus: true,
        style: {
          background: "#ef4444",
        }
      }).showToast();
    }
  }

  checkStatus();
  setInterval(checkStatus, 60000); // Atualiza a cada minuto

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
        // Incrementa a quantidade do item existente
        existingItem.quantity++;
      } else {
        // Adiciona novo item ao carrinho com quantidade 1
        cart.push({ name, price, quantity: 1 });
      }

      updateCartDisplay();
    });
  });

  // Atualiza a exibição do carrinho
  function updateCartDisplay() {
    cartItemsContainer.innerHTML = '';
    cart.forEach((item, index) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.name} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}</span>
        <button class="text-red-500 ml-2" onclick="removeFromCart(${index})">&times;</button>`;
      cartItemsContainer.appendChild(li);
    });

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    cartCountSpan.textContent = cart.reduce((acc, item) => acc + item.quantity, 0); // Número total de itens no carrinho
    cartTotalSpan.textContent = total.toFixed(2);
    cartCountFooter.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);
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

  // Fecha o modal do pedido finalizado
  closeSuccessModal.addEventListener('click', () => {
    successModal.classList.add('hidden');
  });

  closeSuccessModalBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
  });

  // Função para mostrar alertas
  function showAlert(message) {
    alertMessage.innerHTML = message; // Permite HTML
    alertModal.classList.remove('hidden');
  }

  // Finaliza o pedido e envia o resumo via WhatsApp
  checkoutBtn.addEventListener('click', (event) => {
    event.preventDefault(); // Impede o envio do formulário padrão

    // Verifica se a loja está aberta antes de finalizar o pedido
    if (!isStoreOpen()) {
      Toastify({
        text: "A loja está fechada no momento. Tente novamente mais tarde!",
        duration: 6000,
        gravity: "top",
        position: "right",
        style: {
          background: "#ef4444",
        }
      }).showToast();
      return; // Impede o envio do pedido
    }

    const address = document.getElementById('address').value;
    const bairro = document.getElementById('bairro').value;
    const cidade = document.getElementById('cidade').value;

    // Verifica se o carrinho está vazio e se o formulário de endereço está preenchido
    if (cart.length === 0) {
      showAlert('Seu carrinho está vazio. Adicione itens antes de finalizar o pedido.');
      return;
    }

    if (!address || !bairro || !cidade) {
      showAlert('Por favor, preencha todos os campos do endereço.');
      return;
    }

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const itemSummary = cart.map(item => `${item.name} (${item.quantity}x) - R$${(item.price * item.quantity).toFixed(2)}`).join('\n');
    const message = `Resumo do pedido:\n\n${itemSummary}\n\nTotal: R$${total.toFixed(2)}\n\nEndereço: ${address}, ${bairro}, ${cidade}\n\nObrigado pela compra!`;

    // Envia o resumo para o WhatsApp
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl);

    // Exibe o modal de sucesso e limpa o carrinho
    finalTotalSpan.textContent = total.toFixed(2);
    modal.classList.add('hidden');
    successModal.classList.remove('hidden');
    cart.length = 0; // Limpa o carrinho após finalizar
    updateCartDisplay();
  });

  // Exibir chave Pix ao selecionar opção Pix
  paymentOptions.addEventListener('change', function () {
    if (this.value === 'pix') {
      showAlert("Chave Pix: <strong>picpayultra@gmail.com</strong> <i class='fas fa-money-bill-wave text-green-400'></i>");
    }
  });

  // Fechar modal de alerta
  closeAlertModalBtn.addEventListener('click', () => {
    alertModal.classList.add('hidden');
  });

  alertOkBtn.addEventListener('click', () => {
    alertModal.classList.add('hidden');
  });

  // Fecha o modal ao clicar fora dele
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
    if (e.target === successModal) successModal.classList.add('hidden');
    if (e.target === alertModal) alertModal.classList.add('hidden');
  });
});
