// Sólo opciones de filtros / formato. Los perfiles provienen exclusivamente de Firestore.
export const topics = ['Todas las especialidades','Ansiedad y estrés','Duelo y pérdidas','Depresión y bienestar','Prevención del suicidio','Autoestima y relaciones'];
export const money=(amount:number)=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(amount);
export const displayDate=(iso:string)=>new Date(`${iso}T12:00:00`).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'});
