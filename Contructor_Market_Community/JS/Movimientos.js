
        function showPrototype(prototypeId) {
            // Ocultar todos los prototipos
            document.querySelectorAll('.prototype').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            
            // Mostrar el prototipo seleccionado
            document.getElementById(prototypeId).classList.add('active');
            event.target.classList.add('active');
        }

        function switchTab(tabName) {
            // Cambiar tabs de autenticación
            document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
            
            if (tabName === 'login') {
                document.getElementById('login-form').style.display = 'block';
                document.getElementById('register-form').style.display = 'none';
            } else {
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('register-form').style.display = 'block';
            }
        }

        function toggleProductForm() {
            const form = document.getElementById('product-form');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        }
        
        // Agregar interactividad a los elementos
        document.addEventListener('DOMContentLoaded', function() {
            // Simular clicks en los productos
            document.querySelectorAll('.product-card').forEach(card => {
                card.addEventListener('click', function() {
                    card.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        card.style.transform = 'translateY(-5px)';
                    }, 100);
                });
            });
            
            // Efecto hover en botones
            document.querySelectorAll('.btn, .btn-secondary, .btn-sm').forEach(btn => {
                btn.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                });
                
                btn.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
            
            // Simular carga de imágenes
            document.querySelectorAll('.product-image, .product-thumb').forEach(img => {
                img.addEventListener('click', function() {
                    this.innerHTML = '🖼️ Imagen';
                    this.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
                    this.style.color = 'white';
                });
            });
        });
  