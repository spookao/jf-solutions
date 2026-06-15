const token = localStorage.getItem('token');

function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

function handleApiError(response) {
    if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('Unauthorized');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
    loadTestimonials();
    loadContent();
    
    document.getElementById('testimonial-form').addEventListener('submit', handleTestimonialSubmit);
    document.getElementById('content-form').addEventListener('submit', handleContentSubmit);
});

function showTab(tab) {
    document.getElementById('messages-tab').style.display = tab === 'messages' ? 'block' : 'none';
    document.getElementById('testimonials-tab').style.display = tab === 'testimonials' ? 'block' : 'none';
    document.getElementById('content-tab').style.display = tab === 'content' ? 'block' : 'none';
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.innerText.toLowerCase().includes(tab === 'messages' ? 'mensagens' : tab === 'testimonials' ? 'testemunhos' : 'conteúdo')) {
            item.classList.add('active');
        }
    });
}

async function loadMessages() {
    try {
        const response = await fetch(`${API_URL}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        handleApiError(response);
        const messages = await response.json();
        const tbody = document.querySelector('#messages-table tbody');
        
        // Armazenar mensagens para acesso rápido ao visualizar
        window.messagesData = messages.reduce((acc, msg) => {
            acc[msg._id] = msg;
            return acc;
        }, {});

        tbody.innerHTML = messages.map(m => `
            <tr>
                <td>${new Date(m.createdAt).toLocaleDateString()}</td>
                <td>${escapeHTML(m.name)}</td>
                <td>${escapeHTML(m.email)}</td>
                <td>${escapeHTML(m.phone || '-')}</td>
                <td>${escapeHTML(m.serviceType || '-')}</td>
                <td>
                    <button class="action-btn view" onclick="viewMessage('${m._id}')" title="Ver Detalhes"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete" onclick="deleteMessage('${m._id}')" title="Apagar"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading messages');
    }
}

function viewMessage(id) {
    const msg = window.messagesData[id];
    if (!msg) return;

    document.getElementById('msg-date').textContent = new Date(msg.createdAt).toLocaleString('pt-PT');
    document.getElementById('msg-name').textContent = msg.name;
    document.getElementById('msg-phone').textContent = msg.phone || 'Não fornecido';
    document.getElementById('msg-email').textContent = msg.email;
    document.getElementById('msg-service').textContent = msg.serviceType || 'Não especificado';
    document.getElementById('msg-content').textContent = msg.message;

    // Configurar botão de resposta por email
    const replyEmailBtn = document.getElementById('msg-reply-email');
    replyEmailBtn.href = `mailto:${msg.email}?subject=Resposta ao seu contacto - JF Maintenance`;

    // Configurar botão do WhatsApp se houver telefone
    const whatsappBtn = document.getElementById('msg-reply-whatsapp');
    if (msg.phone) {
        const phoneClean = msg.phone.replace(/\D/g, '');
        if (phoneClean.length >= 9) {
            // Se não tiver indicativo, assume Portugal (351)
            const finalPhone = phoneClean.length === 9 ? `351${phoneClean}` : phoneClean;
            whatsappBtn.href = `https://wa.me/${finalPhone}`;
            whatsappBtn.style.display = 'inline-flex';
        } else {
            whatsappBtn.style.display = 'none';
        }
    } else {
        whatsappBtn.style.display = 'none';
    }

    openModal('message-modal');
}

async function deleteMessage(id) {
    if (!confirm('Tem a certeza que deseja apagar esta mensagem?')) return;
    try {
        const response = await fetch(`${API_URL}/messages/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        handleApiError(response);
        loadMessages();
    } catch (error) {
        alert('Erro ao apagar mensagem');
    }
}

async function loadTestimonials() {
    try {
        const response = await fetch(`${API_URL}/testimonials/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        handleApiError(response);
        const testimonials = await response.json();
        const tbody = document.querySelector('#testimonials-table tbody');
        tbody.innerHTML = testimonials.map(t => {
            const escapedName = escapeHTML(t.name);
            const escapedRole = escapeHTML(t.role || '-');
            const escapedContent = escapeHTML(t.content);
            const contentForArgs = escapedContent.replace(/'/g, "\\'");
            return `
            <tr>
                <td>${escapedName}</td>
                <td>${escapedRole}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapedContent}</td>
                <td>${t.rating}/5</td>
                <td>
                    <button class="action-btn edit" onclick="editTestimonial('${t._id}', '${escapedName}', '${escapedRole}', '${contentForArgs}', ${t.rating})" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteTestimonial('${t._id}')" title="Apagar"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `}).join('');
    } catch (error) {
        console.error('Error loading testimonials');
    }
}

async function handleTestimonialSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('testimonial-id').value;
    const data = {
        name: document.getElementById('test-name').value,
        role: document.getElementById('test-role').value,
        content: document.getElementById('test-content').value,
        rating: document.getElementById('test-rating').value
    };
    
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/testimonials/${id}` : `${API_URL}/testimonials`;
    
    try {
        const response = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        handleApiError(response);
        closeModal('testimonial-modal');
        loadTestimonials();
        e.target.reset();
    } catch (error) {
        alert('Erro ao guardar testemunho');
    }
}

function editTestimonial(id, name, role, content, rating) {
    document.getElementById('modal-title').innerText = 'Editar Testemunho';
    document.getElementById('testimonial-id').value = id;
    document.getElementById('test-name').value = name;
    document.getElementById('test-role').value = role;
    document.getElementById('test-content').value = content;
    document.getElementById('test-rating').value = rating;
    openModal('testimonial-modal');
}

async function deleteTestimonial(id) {
    if (!confirm('Tem a certeza?')) return;
    try {
        const response = await fetch(`${API_URL}/testimonials/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        handleApiError(response);
        loadTestimonials();
    } catch (error) {
        alert('Erro ao apagar');
    }
}

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    if (id === 'testimonial-modal') {
        document.getElementById('testimonial-form').reset();
        document.getElementById('testimonial-id').value = '';
        document.getElementById('modal-title').innerText = 'Novo Testemunho';
    }
}

async function loadContent() {
    try {
        const response = await fetch(`${API_URL}/content`);
        const contents = await response.json();
        
        contents.forEach(item => {
            const input = document.getElementById(item.key);
            if (input) {
                input.value = item.value;
            }
        });
    } catch (error) {
        console.error('Error loading content');
    }
}

async function handleContentSubmit(e) {
    e.preventDefault();
    
    const items = [
        { key: 'hero-title', value: document.getElementById('hero-title').value, description: 'Título Principal Hero' },
        { key: 'contact-phone', value: document.getElementById('contact-phone').value, description: 'Telefone de Contacto' },
        { key: 'contact-email', value: document.getElementById('contact-email').value, description: 'Email de Contacto' }
    ];
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerText = 'A Guardar...';
        
        for (const item of items) {
            const response = await fetch(`${API_URL}/content`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(item)
            });
            handleApiError(response);
        }
        alert('Conteúdo atualizado com sucesso!');
    } catch (error) {
        alert('Erro ao atualizar conteúdo');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}
