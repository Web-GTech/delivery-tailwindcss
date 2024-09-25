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
  const spanItem = document.getElementById("date-span");

  // MODAL DE ALERTA
  const alertModal = document.getElementById('alert-modal');
  const alertMessage = document.getElementById('alert-message');
  const closeAlertModalBtn = document.getElementById('close-alert-modal-btn');
  const alertOkBtn = document.getElementById('alert-ok-btn');

  // Horário de funcionamento
  const workingDays = ['segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado', 'domingo'];
  const openHour = 15; // 15:00
  const closeHour = 22; // 22:00

  // Função para verificar se a loja está aberta
 // Função para verificar se o horário atual está dentro do horário de funcionamento
function verificarHorario() {
  const agora = new Date();
  const diaDaSemana = agora.getDay(); // 0 (Domingo) a 6 (Sábado)
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();

  // Horário de funcionamento: Seg a Dom das 18:00 as 22:00
  const horaAbertura = 18; // 18:00
  const horaFechamento = 22; // 22:00

  // Verifica se estamos em um dia da semana (Seg a Dom) e dentro do horário de funcionamento
  const aberto = (diaDaSemana >= 1 && diaDaSemana <= 5) || (diaDaSemana === 0 || diaDaSemana === 6);
  const dentroHorario = horaAtual >= horaAbertura && horaAtual < horaFechamento;

  // Atualiza o background baseado no horário
  if (aberto && dentroHorario) {
    document.body.classList.remove('bg-gray-100'); // remove o fundo normal
    document.body.classList.add('bg-green-200'); // muda para um fundo de aberto
    document.getElementById('status-tarja').innerText = 'Aberto';
    document.getElementById('status-tarja').classList.add('bg-green-600'); // fundo verde para aberto
  } else {
    document.body.classList.remove('bg-green-200'); // remove o fundo de aberto
    document.body.classList.add('bg-red-200'); // muda para um fundo de fechado
    document.getElementById('status-tarja').innerText = 'Fechado';
    document.getElementById('status-tarja').classList.remove('bg-green-600'); // remove fundo verde
    document.getElementById('status-tarja').classList.add('bg-red-600'); // fundo vermelho para fechado
  }
}

// Chama a função ao carregar a página
window.onload = verificarHorario;
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

    // Verifica o status do restaurante
    const isOpen = checkRestauranteOpen();
    if (isOpen) {
      spanItem.classList.remove("bg-red-600");
      spanItem.classList.add("bg-green-600");
    } else {
      spanItem.classList.remove("bg-green-600");
      spanItem.classList.add("bg-red-600");
    }
  }

  checkStatus();
  setInterval(checkStatus, 60000); // Atualiza a cada minuto

  // Função para adicionar item ao carrinho
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', () => {
      const name = button.getAttribute('data-name');
      const price = parseFloat(button.getAttribute('data-price'));
      cart.push({ name, price });
      updateCartDisplay();
    });
  });

  // Atualiza a exibição do carrinho
  function updateCartDisplay() {
    cartItemsContainer.innerHTML = '';
    cart.forEach((item, index) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${item.name} - R$ ${item.price.toFixed(2)}</span>
        <button class="text-red-500 ml-2" onclick="removeFromCart(${index})">&times;</button>`;
      cartItemsContainer.appendChild(li);
    });
    const total = cart.reduce((acc, item) => acc + item.price, 0);
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

    const total = cart.reduce((acc, item) => acc + item.price, 0);
    const itemSummary = cart.map(item => `${item.name} - R$${item.price.toFixed(2)}`).join('\n');
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
