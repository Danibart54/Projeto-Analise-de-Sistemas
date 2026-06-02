# ExtensFlow — Sistema de Avaliação de Projetos de Extensão

## ✅ Pré-requisitos

- **JDK 17+** instalado (verifique com: `java -version`)
- **Maven 3.8+** instalado — [baixe aqui](https://maven.apache.org/download.cgi)
- **Node.js 18+** instalado — [baixe aqui](https://nodejs.org)

### Verificar instalações (PowerShell ou CMD):
```
java -version
mvn -version
node -version
npm -version
```

---

## 🚀 Como rodar no Windows

### 1. Backend (Spring Boot)

Abra o **PowerShell** ou **CMD** na pasta `backend`:

```powershell
cd backend
mvn spring-boot:run
```

> **Nunca use** `.mvnw` — use `mvn` diretamente (requer Maven instalado).

O backend sobe em: **http://localhost:8080**
Console H2 (banco em memória): **http://localhost:8080/h2-console**

**Configurações do H2 Console:**
- JDBC URL: `jdbc:h2:mem:extensflow`
- User: `sa`
- Password: *(vazio)*

### 2. Frontend (React)

Abra **outro** PowerShell/CMD na pasta `frontend`:

```powershell
cd frontend
npm install
npm run dev
```

O frontend sobe em: **http://localhost:3000**

---

## 👥 Contas de demonstração

| Perfil | E-mail | Senha |
|--------|--------|-------|
| 🎓 Aluno | joao@aluno.edu | 123456 |
| 👨‍🏫 Orientador | maria@prof.edu | 123456 |
| ⚖️ Comissão | carlos@comissao.edu | 123456 |

*(criadas automaticamente ao iniciar o backend)*

---

## 🔧 Instalar Maven no Windows (se não tiver)

1. Baixe o ZIP em: https://maven.apache.org/download.cgi
2. Extraia em `C:\Program Files\Maven`
3. Adicione `C:\Program Files\Maven\bin` ao **PATH** do sistema
4. Reinicie o PowerShell e teste: `mvn -version`

**Ou use o Chocolatey:**
```powershell
choco install maven
```

**Ou use o Scoop:**
```powershell
scoop install maven
```

---

## 📊 Fluxo do sistema

```
Aluno cria solicitação (EM_PREENCHIMENTO)
    ↓
Aluno preenche formulário e envia (ENVIADA_PARA_ANALISE)
    ↓
Orientador / Comissão avalia (EM_AVALIACAO)
    ↓
Comissão decide → APROVADA | REPROVADA
    ↓
Secretaria arquiva → CONCLUIDA
```

---

## 🛣️ Endpoints da API

### Autenticação
| Método | URL | Descrição |
|--------|-----|-----------|
| POST | `/api/auth/login` | Login |

### Solicitações
| Método | URL | Descrição |
|--------|-----|-----------|
| GET | `/api/solicitacoes` | Listar todas |
| GET | `/api/solicitacoes?status=APROVADA` | Filtrar por status |
| GET | `/api/solicitacoes/{id}` | Detalhe |
| GET | `/api/solicitacoes/aluno/{alunoId}` | Por aluno |
| POST | `/api/solicitacoes` | Criar |
| PUT | `/api/solicitacoes/{id}/formulario` | Atualizar formulário |
| PUT | `/api/solicitacoes/{id}/enviar` | Enviar para análise |
| PUT | `/api/solicitacoes/{id}/status` | Atualizar status |
| PUT | `/api/solicitacoes/{id}/resultado-final` | Definir resultado final |

### Avaliações
| Método | URL | Descrição |
|--------|-----|-----------|
| POST | `/api/avaliacoes/solicitacao/{id}` | Registrar avaliação |
| GET | `/api/avaliacoes/avaliador/{id}` | Por avaliador |

### Documentos
| Método | URL | Descrição |
|--------|-----|-----------|
| POST | `/api/documentos/solicitacao/{id}` | Gerar documento |
| PUT | `/api/documentos/{id}/assinar` | Assinar |
| GET | `/api/documentos/solicitacao/{id}` | Listar |

### Usuários
| Método | URL | Descrição |
|--------|-----|-----------|
| GET | `/api/usuarios/alunos` | Listar alunos |
| GET | `/api/usuarios/orientadores` | Listar orientadores |
| GET | `/api/usuarios/membros-comissao` | Listar comissão |
| POST | `/api/usuarios` | Cadastrar usuário |
| DELETE | `/api/usuarios/{id}` | Desativar |

### Notificações
| Método | URL | Descrição |
|--------|-----|-----------|
| GET | `/api/notificacoes/usuario/{id}` | Listar por usuário |
| GET | `/api/notificacoes/usuario/{id}/nao-lidas` | Não lidas |
| PUT | `/api/notificacoes/{id}/lida` | Marcar como lida |

---

## 🗂️ Estrutura do projeto

```
extensflow/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/extensflow/
│       ├── ExtensFlowApplication.java
│       ├── config/        ← CORS + DataInitializer
│       ├── controller/    ← REST Controllers
│       ├── dto/           ← Request/Response DTOs
│       ├── exception/     ← Tratamento global de erros
│       ├── model/         ← Entidades JPA
│       ├── repository/    ← Spring Data JPA
│       └── service/       ← Regras de negócio
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── context/       ← AuthContext
        ├── services/      ← API (axios)
        ├── components/    ← Layout
        └── pages/         ← Dashboard, Solicitações, etc.
```

---

## 🛠️ Banco de dados em produção (MySQL/PostgreSQL)

No `backend/src/main/resources/application.properties`, substitua:

```properties
# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/extensflow?createDatabaseIfNotExist=true
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=sua_senha
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

E no `pom.xml`, adicione a dependência do MySQL:
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```
