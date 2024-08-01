
# Sistema de gerenciamento de equipamentos

Desenvolvi esse sistema para a empresa do qual trabalho para gerenciar os equipamentos: saber onde eles estão, editá-los conforme o necessário, deletar e etc. Além disso, tem funções de baixar relatórios, um sistema muito completo

## Índice

- [Funcionalidades](#funcionalidades)
- [Stacks](#tecnologiasbibliotecasframeworks-utilizados)
- [Como testar?](#como-usar)
- [Contato](#autores)

## Funcionalidades

- Criação de equipamentos e locais
- Editar todos os equipamentos e também deletar
- Baixar relatório do local selecionado para ter uma visão mais ampla
- Sistema de leitor de código de barras, muito útil para o processo ser mais rápido

## Tecnologias/Bibliotecas/Frameworks Utilizados

- HTML;
- CSS;
- JavaScript;
- Node.js
- MongoDB
- Express
- JSONWebToken (validar autentificação e segurança);
- SheetJS (criação de relatórios);
- BCrypt (criptografar senha);
- Fetch API.

## Como usar?

Devido a não ter encontrando uma hospedagem gratuita de qualidade, preferi deixar aqui o repositório para que possam testar.

Você precisará ter um pacote de servidor local (wamp, xampp, laragon).

Em seu bash (ou terminal de sua preferência) execute `git clone https://github.com/murisco11/registro-de-equipamentos`
Após isso, digite "npm install mongodb express bcrypt jsonwebtoken".
Depois disso, conecte o servidor MongoDB e modifuqe o URI se necessário.
Digite no Powershell "node server.js" e abra o localhost que aparecerá no Terminal

Ou você pode verificar esse vídeo de demonstração da aplicação no meu linkedin: https://www.linkedin.com/posts/murisco_recentemente-finalizei-o-desenvolvimento-activity-7223793021564141569-CIQT?utm_source=share&utm_medium=member_desktop

## Autores

Este projeto foi desenvolvido por [murisco11] (https://github.com/murisco11).
