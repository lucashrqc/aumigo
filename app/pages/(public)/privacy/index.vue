<script setup lang="ts">
definePageMeta({ layout: 'public' })
useHead({ title: 'Termos de privacidade — Aumigo' })
useSeoMeta({ robots: 'noindex, nofollow' })

type Block =
  | { type: 'text'; text: string }
  | { type: 'define'; term: string; text: string }
  | { type: 'note'; label: string; text: string }
  | { type: 'list'; items: string[] }

interface Section {
  title: string
  blocks: Block[]
}

const lastUpdated = '13 de novembro de 2026'
const contactEmail = 'aumigoadocao@gmail.com'

const intro: string[] = [
  'A sua privacidade e a proteção dos seus dados são fundamentais para nós da Aumigo. Esta Política de Privacidade explica de forma transparente quais dados coletamos, por que coletamos e como os protegemos no contexto da nossa plataforma de adoção de animais.',
  'Ao utilizar nossa plataforma e se candidatar à adoção de um pet, você concorda com os termos descritos abaixo.',
]

const sections: Section[] = [
  {
    title: 'Quais dados coletamos e por quê?',
    blocks: [
      {
        type: 'text',
        text: 'Nós seguimos o princípio da minimização: coletamos apenas o que é estritamente necessário para conectar você a um pet e garantir a segurança do processo de adoção.',
      },
      {
        type: 'define',
        term: 'Dados de Cadastro Básicos (Obrigatórios)',
        text: 'Nome, e-mail e senha. Utilizados para identificar você na plataforma e permitir o acesso à sua conta.',
      },
      {
        type: 'define',
        term: 'Endereço Residencial (Obrigatório na Candidatura)',
        text: 'Coletamos o seu endereço completo no momento da candidatura.',
      },
      {
        type: 'note',
        label: 'Por que coletamos?',
        text: 'O endereço é essencial para a segurança do processo de adoção, permitindo que a organização ou o abrigo realize a validação residencial e, se necessário, o acompanhamento pós-adoção ou resgate do animal em caso de descumprimento das normas de bem-estar previstas no termo de adoção.',
      },
      {
        type: 'define',
        term: 'CPF ou CNPJ (Opcional)',
        text: 'Este campo não é obrigatório para realizar a candidatura.',
      },
      {
        type: 'note',
        label: 'Por que coletamos (se você optar por preencher)?',
        text: 'Caso você deseje que o seu CPF ou CNPJ conste formalmente no Termo de Adoção oficial, você pode fornecê-lo voluntariamente. Se não preencher, a candidatura seguirá normalmente sem esse dado.',
      },
    ],
  },
  {
    title: 'Base Legal para o Tratamento (LGPD)',
    blocks: [
      {
        type: 'text',
        text: 'De acordo com a Lei Geral de Proteção de Dados (LGPD), o tratamento dos seus dados pela nossa plataforma fundamenta-se em:',
      },
      {
        type: 'define',
        term: 'Execução de Procedimentos Preliminares e Contrato',
        text: 'Tratamos o seu endereço e dados de contato para viabilizar a análise da sua candidatura e a formalização do processo de adoção.',
      },
      {
        type: 'define',
        term: 'Legítimo Interesse',
        text: 'O uso de dados de localização e contato visa garantir a proteção, a integridade e o bem-estar dos animais disponibilizados para adoção.',
      },
    ],
  },
  {
    title: 'Com quem compartilhamos os seus dados?',
    blocks: [
      {
        type: 'text',
        text: 'Os seus dados nunca serão vendidos, alugados ou comercializados. O acesso às suas informações (especialmente o seu endereço) é restrito a:',
      },
      {
        type: 'define',
        term: 'Administradores da plataforma e da ONG/Abrigo parceira',
        text: 'Responsáveis diretamente pelo processo de avaliação daquela adoção específica.',
      },
      {
        type: 'define',
        term: 'Autoridades competentes',
        text: 'Apenas em estrito cumprimento de obrigações legais ou ordens judiciais.',
      },
    ],
  },
  {
    title: 'Armazenamento e Segurança da Informação',
    blocks: [
      {
        type: 'text',
        text: 'Adotamos medidas técnicas e administrativas de segurança para proteger os seus dados contra acessos não autorizados, vazamentos ou destruição:',
      },
      {
        type: 'define',
        term: 'Controle de Acesso',
        text: 'Apenas pessoas autorizadas e envolvidas no processo de adoção têm acesso ao seu endereço.',
      },
      {
        type: 'define',
        term: 'Criptografia',
        text: 'Senhas e dados sensíveis são armazenados com criptografia em trânsito e em repouso.',
      },
    ],
  },
  {
    title: 'Retenção e Exclusão de Dados',
    blocks: [
      {
        type: 'text',
        text: 'Se a sua candidatura for aprovada e a adoção concretizada, os dados necessários para o histórico de adoção e termos de responsabilidade serão mantidos pelo tempo exigido para a segurança jurídica do animal e da instituição.',
      },
      {
        type: 'text',
        text: 'Se a sua candidatura não for aprovada, os dados específicos daquela candidatura poderão ser anonimizados ou excluídos após um período razoável, salvo se você optar por mantê-los salvos no seu perfil para futuras candidaturas.',
      },
      {
        type: 'text',
        text: 'Você pode solicitar a exclusão da sua conta e dos seus dados a qualquer momento entrando em contato conosco.',
      },
    ],
  },
  {
    title: 'Seus Direitos como Titular dos Dados',
    blocks: [
      {
        type: 'text',
        text: 'Conforme a LGPD, você tem direito a:',
      },
      {
        type: 'list',
        items: [
          'Confirmar a existência de tratamento de dados;',
          'Acessar seus dados armazenados;',
          'Corrigir dados incompletos, inexatos ou desatualizados;',
          'Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários;',
          'Revogar o consentimento (quando aplicável).',
        ],
      },
    ],
  },
]
</script>

<template>
  <article class="mx-auto flex w-full max-w-3xl flex-col gap-10 pb-16">
    <header class="flex flex-col gap-3 border-b border-forest/10 pb-8">
      <span class="text-[11px] font-semibold tracking-[1.6px] text-forest/60">
        POLÍTICA DE PRIVACIDADE
      </span>
      <h1
        class="text-[32px] font-semibold leading-[1.1] tracking-[-1px] text-forest md:text-[40px]"
      >
        Termos de Privacidade
      </h1>
      <p class="text-sm text-text-soft">
        Última atualização: {{ lastUpdated }}
      </p>
    </header>

    <div class="flex flex-col gap-4">
      <p
        v-for="(paragraph, i) in intro"
        :key="i"
        class="text-[15px] leading-relaxed text-text-soft"
      >
        {{ paragraph }}
      </p>
    </div>

    <section
      v-for="(section, index) in sections"
      :key="section.title"
      class="flex flex-col gap-4"
    >
      <h2 class="flex items-baseline gap-3 text-forest">
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-full bg-forest/10 text-[13px] font-semibold text-forest"
        >
          {{ index + 1 }}
        </span>
        <span class="text-lg font-semibold tracking-[-0.3px]">
          {{ section.title }}
        </span>
      </h2>

      <div class="flex flex-col gap-3 pl-10">
        <template v-for="(block, bi) in section.blocks" :key="bi">
          <p
            v-if="block.type === 'text'"
            class="text-[15px] leading-relaxed text-text-soft"
          >
            {{ block.text }}
          </p>

          <p
            v-else-if="block.type === 'define'"
            class="text-[15px] leading-relaxed text-text-soft"
          >
            <strong class="font-semibold text-forest">{{ block.term }}:</strong>
            {{ block.text }}
          </p>

          <div
            v-else-if="block.type === 'note'"
            class="rounded-lg border-l-2 border-forest/30 bg-cream-soft/60 px-4 py-3"
          >
            <p class="text-[15px] leading-relaxed text-text-soft">
              <strong class="font-semibold text-forest">{{
                block.label
              }}</strong>
              {{ block.text }}
            </p>
          </div>

          <ul
            v-else-if="block.type === 'list'"
            class="flex flex-col gap-2 text-[15px] leading-relaxed text-text-soft"
          >
            <li v-for="(item, li) in block.items" :key="li" class="flex gap-2">
              <span class="mt-2 size-1.5 shrink-0 rounded-full bg-forest/40" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </template>
      </div>
    </section>

    <section
      class="flex flex-col gap-3 rounded-xl border border-forest/10 bg-cream-soft/40 p-6"
    >
      <h2 class="text-lg font-semibold tracking-[-0.3px] text-forest">
        Contato
      </h2>
      <p class="text-[15px] leading-relaxed text-text-soft">
        Se você tiver dúvidas sobre esta Política de Privacidade ou quiser
        exercer os seus direitos relacionados à LGPD, entre em contato conosco
        pelo e-mail:
        <a
          :href="`mailto:${contactEmail}`"
          class="font-semibold text-forest underline underline-offset-2"
        >
          {{ contactEmail }}
        </a>
      </p>
    </section>
  </article>
</template>
