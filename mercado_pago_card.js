(function () {
  const controllers = new Map();
  const canceled = new Set();

  window.nexoMercadoPagoCard = {
    async mount(publicKey, containerId, amount, onSubmit, onError) {
      canceled.delete(containerId);
      if (!window.MercadoPago || !publicKey) {
        onError('Formulário de cartão indisponível.');
        return;
      }
      // HtmlElementView creates its DOM element after onElementCreated returns.
      while (!document.getElementById(containerId) && !canceled.has(containerId)) {
        await new Promise(requestAnimationFrame);
      }
      if (canceled.has(containerId)) return;
      try {
        const builder = new MercadoPago(publicKey, { locale: 'pt-BR' }).bricks();
        const controller = await builder.create('cardPayment', containerId, {
          initialization: { amount },
          customization: { paymentMethods: { maxInstallments: 1 } },
          callbacks: {
            onSubmit(formData, additionalData) {
              return new Promise((resolve, reject) => {
                const data = {
                  cpf: formData.payer?.identification?.number,
                  type: additionalData.paymentTypeId,
                  token: formData.token,
                  paymentMethodId: formData.payment_method_id,
                  installments: Number(formData.installments),
                };
                onSubmit(JSON.stringify(data), resolve, reject);
              });
            },
            onError() { onError('Confira os dados do cartão e tente novamente.'); },
          },
        });
        controllers.set(containerId, controller);
      } catch (_) {
        onError('Não foi possível carregar o formulário seguro do Mercado Pago.');
      }
    },
    unmount(containerId) {
      canceled.add(containerId);
      const controller = controllers.get(containerId);
      if (controller) controller.unmount();
      controllers.delete(containerId);
    },
  };
})();
