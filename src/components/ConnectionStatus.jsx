const connectionLabels = {
  not_connected: 'Não conectado',
  awaiting_configuration: 'Aguardando configuração',
  connected: 'Conectado',
  pending: 'Pendente',
  reauthorization_required: 'Requer nova autorização',
  error: 'Erro',
  requires_reauthorization: 'Requer nova autorização',
};

export default function ConnectionStatus({ status }) {
  return <span className={`connection-status connection-status--${status}`} role="status">
    <span aria-hidden="true">●</span> {connectionLabels[status] || connectionLabels.error}
  </span>;
}
