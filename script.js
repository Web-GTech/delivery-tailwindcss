document.addEventListener('DOMContentLoaded', function () {
  const cart = [];
  const cartBtn = document.getElementById('cart-btn');
  const modal = document.getElementById('modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cartItemsContainer = document.getElementById('cart-itens');
  const cartCountSpan = document.getElementById('cart-count');
  const cartTotalSpan = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('finalize-order-btn');
  const successModal = document.getElementById('success-modal');
  const finalTotalSpan = document.getElementById('final-total');
  const closeSuccessModalBtn = document.getElementById('close-success-modal-btn');
  const cartCountFooter = document.getElementById('cart-count-footer');
  const paymentOptions = document.getElementById('payment-method');
  const statusTarja = document.getElementById('status-tarja');
  const workingHoursDisplay = document.getElementById('working-hours-display'); // Novo elemento para status de horário

  // Horário de funcionamento
  const workingDays = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
  const openHour = 15; // 15:00
  const closeHour = 22; // 22:00

  // Função para verificar se a loja está aberta
  function isStoreOpen() {
    const now = new Date();
    const day = now.toLocaleString('pt-BR', { weekday: 'long' }).toLowerCase(); // Garantir minúsculas
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
        gravity: "top", // top or bottom
        position: "right", // left, center, or right
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

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const itemSummary = cart.map(item => `${item.name} - R$ ${item.price.toFixed(2)} (x${item.quantity})`).join('\n');
    const message = `Resumo do pedido:\n\n${itemSummary}\n\nTotal: R$ ${total.toFixed(2)}\n\nEndereço: ${address}, ${bairro}, ${cidade}\n\nObrigado pela compra!`;

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

  // Fecha o modal ao clicar fora dele
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
    if (e.target === successModal) successModal.classList.add('hidden');
    if (e.target === alertModal) alertModal.classList.add('hidden');
  });
});
