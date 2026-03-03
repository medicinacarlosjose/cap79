const months=["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

let data={};
let showFutureFiveYears = false;
let showPastFiveYears = false;
let showPreviousMonth = false;
const pin="8888";

/* ================= PIN ================= */
function confirmPin(){
  if(document.getElementById("pinInput").value === pin){

    localStorage.setItem("capital79_auth","true");

document.getElementById("pinLock").classList.add("hidden");    document.getElementById("mainApp").classList.remove("hidden");
    document.getElementById("monthsContainer").classList.remove("hidden");
    document.getElementById("footerControls").classList.remove("hidden");

    generateMonths();
  }
}

/* ================= TEMA ================= */
let themes = [
  "dark",
  "light",
  "bordeaux",
  "execemerald",
  "titanium",
  "parisian"
];

let currentThemeIndex = 0;

function toggleTheme(){

  currentThemeIndex++;
  if(currentThemeIndex >= themes.length){
    currentThemeIndex = 0;
  }

  const theme = themes[currentThemeIndex];

  document.body.className = "";
  document.body.classList.add(theme);

  localStorage.setItem("theme", theme);
}

/* ================= MODAL ================= */
function openModal(){
  document.body.classList.add("modal-open");
  modal.classList.remove("hidden");
}

function closeModal(){
  document.body.classList.remove("modal-open");
  modal.classList.add("hidden");
}

/* ================= VISIBILIDADE ================= */
function handleType(){
  const t=expenseType.value;
  expenseCard.classList.toggle("hidden",t!=="parcelado");
  expenseInstallments.classList.toggle("hidden",t!=="parcelado");
}
function handlePayer(){
  otherPayer.classList.toggle("hidden",expensePayer.value!=="Outro");
}

function handleCard(){
  otherCard.classList.toggle("hidden",expenseCard.value!=="Outro");
}

/* ================= SALVAR ================= */
function saveExpense(){
  const value=parseFloat(expenseValue.value);
  if(isNaN(value)) return alert("Valor inválido");

  const type=expenseType.value;
  const payer=expensePayer.value==="Outro"?otherPayer.value:expensePayer.value;
  const card=expenseCard.value==="Outro"?otherCard.value:expenseCard.value;
  const month=expenseMonth.value;
const year = new Date().getFullYear();

  if(type==="parcelado"){
    let installments;

if(expenseInstallments.value === "outro"){
  installments = parseInt(customInstallments.value) || 1;
} else {
  installments = parseInt(expenseInstallments.value);
}

    const base=months.indexOf(month);
    const part=value/installments;

    for(let i=0;i<installments;i++){
      const m=months[(base+i)%12];
      const y=year+Math.floor((base+i)/12);
      const key=`${m}-${y}`;
      if(!data[key]) data[key]=[];
      data[key].push({value:part,type,payer,card});
    }
  }
  else if(type==="recorrente"){
    for(let i=0;i<12;i++){
      const d=new Date(year,months.indexOf(month)+i,1);
      const key=`${months[d.getMonth()]}-${d.getFullYear()}`;
      if(!data[key]) data[key]=[];
      data[key].push({value,type,payer,card});
    }
  }
  else{
    const key=`${month}-${year}`;
    if(!data[key]) data[key]=[];
    data[key].push({value,type,payer,card});
  }

  persist();
  generateMonths();
  closeModal();
}

/* ================= TOGGLE DETALHES ================= */
function toggleDetails(id, btn){
  const el = document.getElementById(id);
  if(!el) return;

  if(el.classList.contains("hidden")){
    el.classList.remove("hidden");
    btn.innerText = "[-]";
  } else {
    el.classList.add("hidden");
    btn.innerText = "[+]";
  }
}

/* ================= GERAR MESES ================= */
function generateMonths(){
const btn = document.getElementById("btnPreviousMonth");
if(btn){
  btn.innerText = showPreviousMonth
    ? "📌 Desafixar mês anterior"
    : "📌 Fixar mês anterior";
}

  const container=document.getElementById("monthsContainer");
  container.innerHTML="";

  const now = new Date();

  // MÊS SEGUINTE AO ATUAL
  let startOffset = 1; // padrão: próximo mês
let totalMonths = 12;

if(showFutureFiveYears){
  totalMonths = 60;
}

if(showPastFiveYears){
  startOffset = -60;
  totalMonths = 60;
}

if(showPreviousMonth){
  startOffset = -1;
  totalMonths = 13; 
}

const startDate = new Date(now.getFullYear(), now.getMonth() + startOffset, 1);

  for(let i=0;i<totalMonths;i++){

    const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);

    const monthIndex = d.getMonth();
    const year = d.getFullYear();

    const key=`${months[monthIndex]}-${year}`;

    if(!data[key]) data[key]=[];

    const vista = data[key].filter(e=>e.type==="vista");
    const parcelado = data[key].filter(e=>e.type==="parcelado");
    const recorrente = data[key].filter(e=>e.type==="recorrente");

    const sum = arr => arr.reduce((s,e)=>s+e.value,0);

    const totalVista = sum(vista);
    const totalParcelado = sum(parcelado);
    const totalRecorrente = sum(recorrente);
    const total = totalVista + totalParcelado + totalRecorrente;

    const meu = data[key]
      .filter(e=>e.payer==="Carlos França" || e.type==="recorrente")
      .reduce((s,e)=>s+e.value,0);

    const saldo=(parseFloat(totalIncome.value)||0)-meu;

    const card=document.createElement("div");
    card.className="month-card";

const savedColors = JSON.parse(
  localStorage.getItem("capital79_cardColors") || "{}"
);

if(savedColors[key]){
  card.style.setProperty(
    "--neon-color",
    savedColors[key]
  );
}

    card.innerHTML=`

  <div class="month-header">
    <h3>${months[monthIndex]} ${year.toString().slice(2)}</h3>

    <span 
      class="color-picker-icon"
      onclick="cycleCardColor('${key}')"
      title="Alterar cor da borda">
      🎨
    </span>
  </div>

  <div><strong>Total:</strong> R$ ${total.toFixed(2)}</div>
      <div><strong>Total:</strong> R$ ${total.toFixed(2)}</div>
      <hr style="opacity:0.08;margin:12px 0">
      ${renderCategory("À Vista", totalVista, vista, `vista-${key}`, key)}
      ${renderCategory("Parcelado", totalParcelado, parcelado, `parcelado-${key}`, key)}
      ${renderCategory("Recorrente", totalRecorrente, recorrente, `recorrente-${key}`, key)}
      <hr style="opacity:0.08;margin:12px 0">
      <div><strong>Meu Valor:</strong> R$ ${meu.toFixed(2)}</div>
      <div><strong>Saldo Atual:</strong> R$ ${saldo.toFixed(2)}</div>
      <div style="margin-top:15px">
        <button class="btn-minimal" onclick="clearMonth('${key}')">
          Limpar mês
        </button>
      </div>
    `;

    container.appendChild(card);
  }

  updateTop();
}

/* ================= RENDER CATEGORY ================= */
function renderCategory(title,total,items,id,key){

  const detailsHTML = items.map((e)=>{

    const originalIndex = data[key].findIndex(item => item === e);

    return `
      <div style="
        margin:6px 0;
        padding:4px 0;
        border-bottom:1px solid rgba(255,255,255,0.06);
        font-size:12px;
        opacity:0.75;
      ">
        R$ ${e.value.toFixed(2)} • ${e.card||""} ${e.card?"•":""} ${e.payer}
        <span 
          onclick="deleteExpense('${key}',${originalIndex})"
          style="cursor:pointer;color:#ff4d4d;margin-left:6px;font-size:12px">
          🗑
        </span>
      </div>
    `;

  }).join("");

  return `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-top:12px;
    ">
      <strong>${title}</strong>
      <div style="display:flex;align-items:center;gap:6px;">
        <span>R$ ${total.toFixed(2)}</span>
        <span 
          onclick="toggleDetails('${id}',this)"
          style="
            cursor:pointer;
            color:#d4af37;
            font-weight:bold;
          "
        >
          [+]
        </span>
      </div>
    </div>

    <div id="${id}" class="hidden">
      ${detailsHTML}
    </div>
  `;
}

/* ================= TOPO ================= */
function updateTop(){

  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const key = `${months[nextMonth.getMonth()]}-${nextMonth.getFullYear()}`;

  const income = parseFloat(totalIncome.value) || 0;

  const monthData = data[key] || [];

  const total = monthData.reduce((s,e)=>s+e.value,0);

  const meu = monthData
    .filter(e=>e.payer==="Carlos França" || e.type==="recorrente")
    .reduce((s,e)=>s+e.value,0);

  currentExpense.innerText=`R$ ${total.toFixed(2)}`;
  balance.innerText=`R$ ${(income - meu).toFixed(2)}`;
}

/* ================= CONTROLES ================= */
function toggleFutureFiveYears(){
  showFutureFiveYears = !showFutureFiveYears;
  showPastFiveYears = false;
  generateMonths();
}

function togglePastFiveYears(){
  showPastFiveYears = !showPastFiveYears;
  showFutureFiveYears = false;
  generateMonths();
}

function togglePreviousMonth(){

  showPreviousMonth = !showPreviousMonth;

  showFutureFiveYears = false;
  showPastFiveYears = false;

  // 🔒 Persistência real
  localStorage.setItem(
    "capital79_previousMonthPinned",
    showPreviousMonth
  );

  generateMonths();
}

function clearMonth(key){
  if(confirm("Limpar mês?")){
    delete data[key];
    persist();
    generateMonths();
  }
}

function triggerImport(){
  document.getElementById("hiddenImport").click();
}

function importData(e){

  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = () => {

    const imported = JSON.parse(reader.result);

    if(imported.financeData){

      data = imported.financeData;
      totalIncome.value = imported.income || "";

      localStorage.setItem(
        "capital79_reminders",
        JSON.stringify(imported.reminders || [])
      );

      localStorage.setItem(
        "capital79_rt",
        imported.rt || ""
      );

      localStorage.setItem(
        "theme",
        imported.theme || ""
      );

      // 🔒 Restaurar fixação
      showPreviousMonth = imported.previousMonthPinned || false;

      localStorage.setItem(
        "capital79_previousMonthPinned",
        showPreviousMonth
      );

    } else {
      // Backup antigo
      data = imported;
    }

    persist();
    generateMonths();
  };

  reader.readAsText(file);
}

/* ================= INIT ================= */
(function init(){

  const d = localStorage.getItem("financeData");
  if(d) data = JSON.parse(d);

  const inc = localStorage.getItem("income");
  if(inc) totalIncome.value = inc;

  const savedTheme = localStorage.getItem("theme");
  if(savedTheme){
    document.body.classList.add(savedTheme);
    currentThemeIndex = themes.indexOf(savedTheme);
  }

  // 🔒 Restaurar mês anterior fixado
  const pinned = localStorage.getItem("capital79_previousMonthPinned");
  if(pinned === "true"){
    showPreviousMonth = true;
  }

  const isAuth = localStorage.getItem("capital79_auth");

  if(isAuth === "true"){
document.getElementById("pinLock").classList.add("hidden");    document.getElementById("mainApp").classList.remove("hidden");
    document.getElementById("monthsContainer").classList.remove("hidden");
    document.getElementById("footerControls").classList.remove("hidden");
    generateMonths();
  }

})();

/* ================= PDF GRÁFICO ANUAL ================= */

async function generateAnnualPDF(){

  const { jsPDF } = window.jspdf;

  const years = [...new Set(
    Object.keys(data).map(k => k.split("-")[1])
  )];

  if(years.length === 0){
    alert("Sem dados para gerar gráfico.");
    return;
  }

  for(const year of years){

    const doc = new jsPDF("landscape");

    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    const totals = months.map(m => {
      const key = `${m}-${year}`;
      return (data[key]||[])
        .reduce((s,e)=>s+e.value,0);
    });

    new Chart(ctx,{
      type:"bar",
      data:{
        labels:months,
        datasets:[{
          label:`Despesas ${year}`,
          data:totals,
          backgroundColor:"#d4af37"
        }]
      },
      options:{
        responsive:false,
        plugins:{
          legend:{display:false}
        },
        scales:{
          y:{
            ticks:{color:"#000"}
          }
        }
      }
    });

    await new Promise(r=>setTimeout(r,500));

    const img = canvas.toDataURL("image/png");

    doc.setFontSize(18);
    doc.text(`CAPITAL 79 - Relatório Financeiro ${year}`, 14, 20);
    doc.addImage(img,"PNG",15,30,260,100);

    doc.save(`Capital79_${year}.pdf`);
  }
}

function exportData(){

  const backup = {
    financeData: data,
    income: totalIncome.value,
    reminders: JSON.parse(localStorage.getItem("capital79_reminders") || "[]"),
    rt: localStorage.getItem("capital79_rt") || "",
    theme: localStorage.getItem("theme") || "",
    previousMonthPinned: showPreviousMonth
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    {type:"application/json"}
  );

  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="capital79-backup-completo.json";
  a.click();
}

function deleteExpense(key, index){
  if(!data[key]) return;

  data[key].splice(index,1);

  if(data[key].length === 0){
    delete data[key];
  }

  persist();
  generateMonths();
}

const neonColors = [
  "#00ff8c", // verde
  "#00f0ff", // azul
  "#ff00c8", // pink
  "#ffd700", // gold
  "#ff4d4d"  // vermelho
];

function cycleCardColor(key){

  const saved = JSON.parse(
    localStorage.getItem("capital79_cardColors") || "{}"
  );

  const currentIndex = neonColors.indexOf(saved[key]);
  const nextIndex = (currentIndex + 1) % neonColors.length;

  saved[key] = neonColors[nextIndex];

  localStorage.setItem(
    "capital79_cardColors",
    JSON.stringify(saved)
  );

  generateMonths();
}

function handleCard(){
  otherCard.classList.toggle("hidden",expenseCard.value!=="Outro");
}

function getCurrentMonthMyValue(){
  const currentMonthCard = document.querySelector(".month-card.current");
  if(!currentMonthCard) return 0;

  const myValueText = currentMonthCard.querySelector(".my-value")?.innerText || "R$ 0,00";
  return parseFloat(myValueText.replace("R$","").replace(".","").replace(",",".").trim()) || 0;
}

function handleInstallments(){
  customInstallments.classList.toggle(
    "hidden",
    expenseInstallments.value !== "outro"
  );
}

function openRTModal(){
  document.getElementById("rtModal").classList.remove("hidden");

  const saved = localStorage.getItem("capital79_rt");
  if(saved){
    document.getElementById("rtInput").value = saved;
  }
}

function closeRTModal(){
  document.getElementById("rtModal").classList.add("hidden");
}

function saveRT(){
  const value = document.getElementById("rtInput").value;
  localStorage.setItem("capital79_rt", value);
  closeRTModal();
}

function logout(){
  localStorage.removeItem("capital79_auth");
  location.reload();
}

function persist(){
  localStorage.setItem("financeData", JSON.stringify(data));
  localStorage.setItem("income", totalIncome.value);
}