import { useState, useEffect, useCallback, useRef } from "react";

const SUPABASE_URL = "https://wiuwuacfpqmhjyzqekzl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpdXd1YWNmcHFtaGp5enFla3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDEzMjAsImV4cCI6MjA4OTkxNzMyMH0.oTRdx_TmTa3EyyyNbqu_lY0seTM2tHsk_rhLY_yPH6Q";

const api = async (table, method = "GET", body = null, filter = "") => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${filter}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (method === "GET") return res.json();
  return res.ok;
};

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
}
function getTodayLabel() { return new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" }); }
function getCurrentSession() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() < 14 * 60 ? "morning" : "afternoon";
}


const DRUG_LIST = ["아스피린프로텍트정100밀리그람", "뮤테란캡슐200밀리그램", "케이캡정50밀리그램", "가스모틴정5밀리그람", "디카맥스디정", "타이레놀8시간이알서방정", "조인스정200밀리그램", "플라빅스정75밀리그람", "스티렌투엑스정", "엘도스캡슐", "훼로바-유서방정", "오로디핀정", "리피토정10밀리그램", "무코스타서방정150밀리그램", "쎄레브렉스캡슐200밀리그램", "크레스논정5밀리그램", "라식스정", "소론도정", "레날민정", "세비카정5/20밀리그램", "씨씨본정", "모티리톤정50%에탄올연조엑스,30MG/1정", "스토가정10밀리그램", "파라마셋정", "페니라민정", "아크로펜정", "글리아타민연질캡슐", "트라젠타정", "마그밀정", "로수젯정10/5밀리그램", "서울파모티딘정20MG", "씨잘정5밀리그램", "코데날정", "올메텍정20밀리그램", "리리카캡슐75밀리그램", "로자살탄정50밀리그람", "베포텐정10밀리그램", "무코스타정", "아로베스트정", "신일폴산정", "쎄레브렉스캡슐100밀리그램", "코푸시럽", "원알파정", "오마코연질캡슐", "로수젯정10/10밀리그램", "목시클정625밀리그램", "삐콤정", "글루파정850MG", "네비스톨정2.5밀리그램", "페브릭정40밀리그램", "크레스논정10밀리그램", "동아오팔몬정", "디아미크롱서방정", "아타칸정8밀리그램", "이모튼캡슐", "렌벨라정", "하루날디정0.2밀리그람", "베타미가서방정50밀리그램", "리피토정20밀리그램", "뉴론틴캡슐100밀리그램", "동아가스터정20밀리그램", "아토젯정10/10밀리그램", "아토젯정10/20밀리그램", "유한세파클러캡슐", "판토록정20밀리그램", "다이아벡스정250밀리그램", "덱시드정480밀리그램", "트라젠타듀오정2.5/500밀리그램", "다이크로짇정", "시그마트정5밀리그램", "레보투스정", "아토르바정20밀리그램", "포리부틴정", "아달라트오로스정30", "포시가정10밀리그램", "뉴론틴캡슐300밀리그램", "유한메토트렉세이트정", "씬지로이드정0.1밀리그램", "고덱스캡슐", "동아슈프락스캡슐100밀리그램", "글리멜정2MG", "코대원정", "훌그램캡슐", "솔레톤정", "종근당아목시실린캡슐500밀리그램", "아디팜정", "바난정", "유로박솜캡슐", "세토펜8시간이알서방정", "스틸녹스정10밀리그램", "리리카캡슐150밀리그램", "올메텍정10밀리그램", "다이아벡스정500밀리그램", "트라젠타듀오정2.5/850밀리그램", "리보트릴정", "아토르바정10밀리그램", "프레탈정50밀리그램", "펠루비서방정", "에스로반연고", "놀텍정10밀리그램", "슈다페드정", "디오반필름코팅정80밀리그램", "아프로벨정150밀리그람", "콩코르정2.5밀리그램", "씬지로이드정0.05밀리그램", "알레그라정180밀리그람", "다이아벡스엑스알서방정", "티로파정", "메치론정", "에소메졸캡슐20밀리그램", "센시발정10밀리그램", "우루사정200밀리그램", "우루사정100밀리그램", "파마메코발라민정", "로수젯정10/2.5밀리그램", "써스펜8시간이알서방정650밀리그램", "한국유나이티드염산메트포르민정", "타스나정", "파자임95이중정", "네프비타정", "헤르벤서방정90밀리그램", "리넥신정", "파라마셋세미정", "펜넬캡슐", "도베셀정500밀리그램", "리바로정2밀리그램", "베이슨정0.2밀리그램", "씬지로이드정0.075밀리그램", "자디앙정25밀리그램", "자나팜정0.25밀리그람", "듀락칸이지시럽", "에스글리토정25/5밀리그램", "부스코판당의정", "트리진정", "리피딜슈프라정", "울트라셋세미정", "명문아트로다캡슐", "비카페롤플러스정", "로수젯정10/20밀리그램", "제미글로정50밀리그램", "글립타이드정200밀리그람", "기넥신에프정80밀리그램", "테넬리아정20밀리그램", "트윈스타정40/5밀리그램", "자디앙정10밀리그램", "콩코르정5밀리그램", "가스터디정20㎎", "스피락톤정50MG", "라본디캡슐", "노바스크정5밀리그람", "딜라트렌정", "메디락디에스장용캡슐", "엔테론정150밀리그람", "덱실란트디알캡슐30밀리그램", "마이폴캡슐", "쿠파린정2밀리그램", "인데놀정10MG", "자디앙듀오정12.5/500밀리그램", "프레탈정100밀리그램", "듀카브정30/5밀리그램", "프로맥정", "삼남로페라마이드캡슐", "하나니트로글리세린0.6밀리그람설하정", "알마겔현탁액", "레가론캡슐140", "부루펜정200밀리그램", "마이토닌정25밀리그램", "코다론정", "코대원에스시럽", "딜라트렌정12.5MG", "미오날정", "타진서방정10/5MG", "기넥신에프정", "싸이신정500밀리그램", "아보테리드연질캡슐0.5밀리그램", "부광메티마졸정", "펙수클루정40밀리그램", "릭시아나정30밀리그램", "세비카에이치씨티정5/20/12.5밀리그램", "티어린프리점안액", "메디락에스장용캡슐", "트루다파정10밀리그램", "가스티인씨알정", "판토록정40밀리그램", "베니톨정", "현대테놀민정25밀리그람", "리세넥스플러스정", "심발타캡슐30밀리그램", "에보프림연질캡슐", "액시마정", "한미탐스오디정0.4밀리그램", "록솔정", "펠루비정", "트리돌캡슐", "메바로친정40밀리그램", "레그파라정25밀리그램", "노보믹스30플렉스펜주100단위/밀리리터", "알닥톤필름코팅정25밀리그람", "록소드펜정60밀리그램", "다이아벡스정1000밀리그램", "디아미크롱서방정60밀리그램", "란스톤엘에프디티정15밀리그램", "라베원정20밀리그램", "카발린캡슐25밀리그램", "딜라트렌정6.25MG", "명인아미트리프틸린염산염정10밀리그람", "보나링에이정", "란투스주솔로스타", "타진서방정20/10MG", "아토젯정10/40밀리그램", "아이알코돈정5밀리그램", "쿠파린정5밀리그램", "할록신정200밀리그램", "카나브정30밀리그램", "콜킨정", "모사피트정5밀리그램", "크라비트점안액1.5%", "람노스캡슐", "모빅캡슐7.5밀리그램", "삼남아세트아미노펜정", "트레시바플렉스터치주100단위/밀리리터", "바헬바레스피맷", "세비카정5/40밀리그램", "동아가바펜틴캡슐100밀리그램", "자나팜정0.125밀리그램", "유한덱사메타손정", "슈가논정5밀리그램", "디고신정", "로자살탄플러스정", "베시케어정5밀리그램", "네시나정25밀리그램", "라베원정10밀리그램", "플리바스정75MG", "싱귤레어정10밀리그램", "엘리퀴스정5밀리그램", "아모잘탄정5/50밀리그램", "케프라정500밀리그램", "오논캡슐", "아마릴엠정2/500밀리그람", "씬지록신정50마이크로그램", "아리셉트에비스정10밀리그램", "애니코프캡슐300밀리그램", "마그네스정", "싸이신정250밀리그램", "토파맥스정25밀리그램", "보령메이액트정100밀리그램", "베라실정", "베이슨정0.3밀리그램", "케토톱엘플라스타", "부광아젭틴정", "코솝에스점안액", "몰시톤정4밀리그람", "유트로핀에스펜주", "제미메트서방정25/500밀리그램", "녹더나설하정50마이크로그램", "칼시오연질캡슐0.25마이크로그램", "아프로벨정300밀리그람", "카리메트과립", "리조덱플렉스터치주100단위/밀리리터", "트라젠타듀오정2.5/1000밀리그램", "이달비정40밀리그램", "릭시아나정60밀리그램", "포리부틴서방정", "덱실란트디알캡슐60밀리그램", "자디앙듀오정12.5/850밀리그램", "삼진디아제팜정2밀리그람", "잘라탄점안액50㎍/㎖", "엘리퀴스정2.5밀리그램", "카나브정60밀리그램", "글리멜정4MG", "이소트릴지속정60밀리그람", "사이폴-엔연질캡슐100밀리그램", "디푸코연고0.3%", "데스오웬로션0.05%", "한독바클로펜정10밀리그램", "아타칸정16밀리그램", "올메텍플러스정20/12.5밀리그램", "안플라그정100밀리그람", "네비레트정", "타진서방정5/2.5MG", "미라벡서방정50밀리그램", "졸민정0.25밀리그램", "오로살탄정5/80밀리그램", "듀카브정60/5밀리그램", "트루패스구강붕해정8밀리그램", "클래리시드필름코팅정500밀리그람", "솝튼정", "프리토정40밀리그램", "그리자이드정[캄보디아", "보령토르세미드정5밀리그람", "시네츄라시럽", "아레이정10밀리그람", "스타브론정", "자트랄엑스엘정10밀리그램", "루키오정10밀리그램", "영풍독시사이클린정100밀리그램", "헥사메딘액0.12%", "자누비아정25밀리그램", "후라시닐정", "명인디스그렌캡슐", "시나롱정10밀리그램", "네스티칼현탁액", "스토엠정", "크레스논정20밀리그램", "헤르벤정", "자이로릭정", "맥페란정", "트라보겐크림", "자누메트정50/500밀리그램", "엔트레스토필름코팅정50밀리그램", "셉트린정", "제미메트서방정50/500밀리그램", "룩펠정", "세비카에이치씨티정5/40/12.5밀리그램", "삼아탄툼액", "자누메트정50/850밀리그램", "뉴론틴캡슐400밀리그램", "살라겐정", "데파코트서방정500㎎", "인데놀정40MG", "보령바이오아스트릭스캡슐100밀리그램", "투제오주솔로스타", "비가목스점안액0.5%", "지노프로질정", "제미다파정", "셀벡스캡슐", "포스터넥스트할러", "가브스메트정50/500밀리그램", "가브스정50밀리그램", "에어탈정", "직듀오서방정10/1000밀리그램", "할록신정", "아리셉트에비스정5밀리그램", "세비카정10/40밀리그램", "캘코트정6밀리그람", "노르믹스정", "에리우스정", "둘코락스에스정", "알마겔정", "신일피리독신정", "비리어드정", "노자임캅셀", "앤지비드서방정40MG", "이지트롤정", "포스터100/6에이치에프에이", "다이아벡스엑스알서방정1000밀리그램", "가브스메트정50/850밀리그램", "실콘정", "미니린정0.1밀리그램", "비오플250산", "알콕시아정30밀리그램", "트레스탄캅셀", "텔미트렌정20밀리그램", "보령에바스텔정", "뮤테란캡슐100밀리그램", "아자프린정", "메바로친정20밀리그램", "리리카캡슐50밀리그램", "명인브로마제팜정3밀리그람[", "자디앙듀오정5/500밀리그램", "옥타론에이취알정600밀리그램", "바라클정0.5밀리그램", "알말정5밀리그램", "비비안트정20밀리그램", "바이겔크림", "애드칼정", "시나롱정5밀리그램", "프로토픽연고0.1%", "펜타사서방정1G", "한일비타메진캅셀25MG", "이달비정80밀리그램", "뮤테란과립200밀리그램", "알파간피점안액0.15%", "씬지로이드정0.025밀리그램", "에비스타정60밀리그람", "플리바스정50MG", "대웅푸루나졸정150밀리그램", "히아박점안액", "딜라스틴나잘스프레이", "씬지록신정125마이크로그램", "리록스반정15밀리그램", "후로스판디정", "토피솔밀크로션", "사이폴-엔연질캡슐25밀리그램", "테그레톨정200밀리그램", "베믈리디정", "브레트라정", "리피토정40밀리그램", "싸이메트정", "암로핀정5밀리그람", "알레그라정120밀리그람", "스틸녹스CR정6.25밀리그램", "싸이젠리퀴드카트리지주5.83MG/ML", "트윈스타정40/10밀리그램", "도란사민캅셀", "로테맥스점안현탁액0.5%", "안티로이드정", "모비졸로정1밀리그램", "에트라빌10밀리그램정", "액티피드정", "노스판패취10㎍/H", "레나메진캡슐", "마이렙트정500밀리그램", "자누비아정100밀리그램", "세비카에이치씨티정10/40/12.5밀리그램", "리록스반정20밀리그램", "뉴로패시드오디정600밀리그람", "현대미녹시딜정", "리세토정", "피나스타정", "씨베리움캡슐", "루리드정", "움카민플러스시럽", "피레스파정200밀리그램", "엔테론정50밀리그람", "아이커비스점안액0.1%", "알긴엔액", "올메텍정40밀리그램", "오엔지질연질캡슐", "에스글리토정10/5밀리그램", "낙센에프정", "유한세프라딘캡슐500밀리그램", "파제오0.7%점안액", "히아루론맥스점안액0.18%", "자누메트정50/1000밀리그램", "오로살탄정5/160밀리그램", "메바로친정10밀리그램", "목시클정375밀리그램", "타리비드이용액", "라믹탈정100밀리그램", "씬지록신정88마이크로그램", "케프라정250밀리그램", "코프리그렐캡슐", "유한비타민씨정1000MG", "디오반필름코팅정160밀리그램", "구주인산코데인정", "펜타듀르패취25μG/H", "더모베이트액", "렉라자정80밀리그램", "직듀오서방정10/500밀리그램", "리비알정", "심발타캡슐60밀리그램", "듀비에정0.5밀리그램", "알레버트20mg", "트렐리지엘립타", "벤토린에보할러", "듀카브플러스정30/5/12.5밀리그램", "아기오과립3.9G,차전자피0.13G],4.08G/6G", "케타스캅셀10밀리그람", "마이렙트캡슐250밀리그램", "옵서미트정10밀리그램", "딜라트렌에스알캡슐8밀리그램", "노스판패취5㎍/H", "케프라정1000밀리그램", "리바로정4밀리그램", "트윈스타정80/5밀리그램", "베스타제당의정", "엔트레스토필름코팅정100밀리그램", "디쿠아스-에스점안액3%", "애피드라주솔로스타", "로와콜연질캅셀", "뉴론틴정600밀리그램", "앱스트랄설하정100마이크로그램", "라게브리오캡슐", "하이로손크림", "에빅사정", "현대테놀민정", "리리카캡슐300밀리그램", "듀카브플러스정60/10/12.5밀리그램", "카발린캡슐50밀리그램", "한미탐스캡슐0.4밀리그램", "보령부스파정5밀리그램", "프로그랍캅셀1밀리그람", "이토메드정", "구구츄정 5mg", "낙센에스정500/20밀리그램", "뉴신타서방정100밀리그램", "탐스날서방정", "에소메졸캡슐40밀리그램", "비잔정", "엘라좁점안현탁액", "아노로62.5엘립타", "자나팜정0.5밀리그람", "크레메진세립", "렉사프로정5밀리그람", "프레드벨1%점안액", "비유피-4정10밀리그램", "포사맥스플러스디정", "에스파손로션", "메게이스내복현탁액", "네오팻정100밀리그램", "조피린장용정", "린버크서방정15밀리그램", "울트라셋이알서방정", "다이보베트연고", "메스티논정", "카두라엑스엘서방정4MG", "렉사프로정10밀리그람", "테베텐플러스정", "로포타현탁액", "뉴신타서방정50밀리그램", "서카딘서방정2mg", "트루리시티1.5밀리그램/0.5밀리리터일회용펜", "디3베이스경구드롭스 10000IU", "데파코트서방정250MG", "레미닐피알서방캡슐8밀리그램", "글루코바이정50밀리그람", "유한짓정", "환인트라조돈염산염캡슐", "오베스틴질좌제", "세토펜정325밀리그램", "안젤릭정", "엘리델크림1%", "아마릴엠정1/500밀리그램", "놀바덱스디정", "씬지로이드정0.15밀리그램", "쿠에타핀정25밀리그램", "칸데모어정8밀리그램", "오메크린크림5%", "나조넥스나잘스프레이", "글리벡필름코팅정100밀리그램", "바난건조시럽50밀리그램/5ML", "플로리네프정", "브로낙점안액", "타진서방정40/20MG", "나라믹정2.5밀리그램", "오큐프록스안연고", "듀카브플러스정60/5/12.5밀리그램", "메네스정", "코미시럽", "테라싸이클린캅셀250밀리그람", "옴니세프캡슐100밀리그램", "리노에바스텔캡슐", "오큐메토론점안액0.1%", "리프레쉬플러스점안액0.5%", "에빅사정20밀리그램", "알말정10밀리그램", "토비애즈서방정4밀리그람", "넥시움정40밀리그람", "노보래피드플렉스펜주100단위/밀리리터", "라벤다크림", "라믹탈정50밀리그램", "오르필서방정300밀리그램", "젤미론캡슐", "후루덱스서방정", "듀카브정60/10밀리그램", "익셀캡슐12.5밀리그램", "포타겔현탁액", "아마릴엠정1/250밀리그람", "베스타제정", "트리헥신정", "리박트과립", "뉴도탑카타플라스마", "졸민정0.125밀리그람", "팍스로비드정", "가티플로점안액", "엑세그란정", "페브릭정80MG", "쿠에타핀정12.5밀리그램", "레보투스시럽", "대원메게스트롤아세테이트현탁액", "푸루나졸캡슐50밀리그램", "글루코반스정500/5밀리그램", "메자반트엑스엘장용정1200밀리그램", "씨잘액", "미카르디스정40밀리그램", "리포덱스정600밀리그람/종근당리팜피신정600밀리그람", "엠라5%크림", "포스포산", "아드반탄연고", "주블리아외용액 4ml", "미니린정0.2밀리그램", "카나브정120밀리그램", "리트모놈SR서방캡슐225밀리그램", "목시클듀오시럽228MG/5ML", "넥시움정20밀리그람", "스틸녹스CR정12.5밀리그램", "올루미언트정4밀리그램", "삼아케토티펜정", "한미유리아크림200밀리그램", "로벨리토정150/10밀리그램", "프로기노바28정1밀리그램", "아레이정20밀리그람", "리리카캡슐25밀리그램", "플리바스정25MG", "마이암부톨제피정400밀리그램", "신일디클로페낙나트륨정50밀리그람", "휴마로그믹스50퀵펜주100단위/밀리리터", "유니레보정", "이든세파클러캡슐", "펜타듀르패취12UG/H", "야즈정", "센틸정5밀리그람", "업트라비정800마이크로그램", "네오팻정50밀리그램", "익셀캡슐25밀리그램", "자디앙듀오정12.5/1000밀리그램", "듀카브정30/10밀리그램", "라코르정60/12.5밀리그램", "비카루드정", "펠로정5밀리그램", "벨포로츄어블정", "딜라트렌에스알캡슐16밀리그램", "발트렉스정500밀리그램", "보령메이액트세립", "애니펜정", "베톱틱-에스점안액", "락티케어에취씨로션1%", "클리마토플란정250mg", "업트라비정200마이크로그램", "미드론정", "듀오락스정", "란스톤엘에프디티정30밀리그램", "디아미크롱정", "엑스포지정5/80밀리그램", "비모보정500/20밀리그램", "아마릴정2밀리그람", "휴마로그믹스25퀵펜주100단위/밀리리터", "콤비간점안액", "큐아렌점안액", "테올란비서방캡슐100밀리그램", "트리테이스정2.5밀리그람", "후로스판정", "이리보정5마이크로그램", "티지페논정", "크라비트정500밀리그람", "바크락스연고", "일성호이판정", "헤르벤서방캡슐180밀리그램", "트루셋정80/5/12.5밀리그램", "레스타시스점안액0.05%", "엑스탄디연질캡슐40MG", "브린텔릭스정5밀리그램", "녹더나설하정25마이크로그램", "젤로다정500밀리그램", "릴렉시아정", "펜타사좌약", "큐라실정125밀리그람", "유트로게스탄연질캡슐", "센시발정25밀리그램", "바이독시정", "리포직점안겔10g", "데파킨크로노정500밀리그램", "트리렙탈필름코팅정300밀리그램", "네시나정12.5밀리그램", "오로살탄정10/160밀리그램", "엔커버액", "박사르정2밀리그램", "글루파엑스알서방정850밀리그램", "제미메트서방정50/1000밀리그램", "보령뮤코미스트액10%", "자이데나100mg", "엑스포지정10/160밀리그램", "오구멘틴정375밀리그램", "로세릴크림", "락티케어제마지스로션0.25%", "일양디세텔정", "타프콤점안액", "유한프레가발린서방정150밀리그램", "앱스트랄설하정200마이크로그램", "멀타핀정7.5밀리그램", "시코연질캡슐", "데놀정", "유한피라진아미드정500밀리그램", "루키오츄정5밀리그램", "알모그란정", "레티정", "프로토픽연고0.03%", "국제아시클로버크림", "카마제핀씨알정200밀리그람", "프리토정80밀리그램", "릭시아나정15밀리그램", "렉사프로정20밀리그람", "리피토정80밀리그램", "가스토텍정", "카리메트산", "아티반정1밀리그람", "로와치넥스캅셀", "타미플루캡슐75밀리그램", "스피리바레스피맷", "플루티폼흡입제250μG/10μG", "주블리아외용액8ML**", "모누롤산", "삼아리도멕스크림", "콤포나콤팩트에어250/50", "토파맥스스프링클캡슐50밀리그램", "트리렙탈필름코팅정600밀리그램", "오르필서방정150밀리그램", "환인이미프라민염산염정25밀리그램", "아사콜디알정1600밀리그람", "트리테이스정5밀리그람", "볼그레액", "슈글렛정50밀리그램", "프로기노바28정2밀리그램", "리록스반정10밀리그램", "아자프린정25밀리그램", "마비렛정", "헤브론에프정", "하이그로톤정25밀리그람", "팜빅스정", "펜타듀르패취50μG/H", "지스로맥스정250밀리그람", "다이보넥스연고", "더모베이트연고", "더마톱연고0.25%", "로세릴네일라카", "더마톱액0.25%", "일성이솦틴정40밀리그램", "니페론씨알40서방정", "졸로푸트정100밀리그램", "멀택정", "게루삼정", "두드리진시럽", "타플로탄-에스점안액0.0015%", "아이클루시그정15밀리그램", "심바로드정20밀리그람", "데파스정0.25밀리그램", "베넥사엑스알서방캡슐75MG", "젤로다정150밀리그램", "클래리정250밀리그램", "프로베정", "메수리드정", "구주오플록사신정200밀리그람", "삭센다펜주6mg/ml", "노비프록스액", "아바미스나잘스프레이", "휴텍스플루코나졸정150MG", "알레센자캡슐150밀리그램", "하나페노바르비탈정", "케이콘틴서방정", "트루셋정40/5/12.5밀리그램", "박사르정4밀리그램", "아타칸정32밀리그램", "디푸루칸건조시럽", "뮤코졸정", "쿠에타핀정50밀리그램", "프로페시아 1mg", "알지겐액", "모비졸로정2밀리그램", "옥시콘틴서방정10밀리그램", "어린이부루펜시럽", "글루코바이정100밀리그람", "네오티가손캡슐10밀리그램", "싸이토텍정200마이크로그람", "카보메틱스정60밀리그램", "엡클루사정", "레보텐션정2.5밀리그램", "아마릴정1밀리그람", "라미나지액", "큐시미아캡슐 7.5MG", "스티렌정", "팔팔츄정50mg", "비아그라100MG", "레파타주프리필드펜", "조터나흡입용캡슐110/50마이크로그램", "세트락살플러스점이액", "탬보코정", "액토스정30밀리그램", "소타론정", "펜타사서방과립2그램", "하모닐란액", "글레존정", "아티반정0.5밀리그람", "맥스마빌장용정", "미르탁스오디티정15밀리그램", "보령토르세미드정10밀리그람", "스프라이셀정80밀리그램", "바라크루드정0.5밀리그램", "지르텍정", "입랜스캡슐125MG", "둘코락스좌약", "포사퀸정70밀리그람", "안국록소프로펜나트륨정", "휴물린엔퀵펜주100단위/밀리리터", "심비코트터부헬러160/4.5마이크로그램", "라스타카프트점안액0.25%", "토파맥스정100밀리그램", "환인히단토인정", "사미온정10밀리그램", "트리렙탈필름코팅정150밀리그램", "퍼킨정25-100MG", "엔트레스토필름코팅정200밀리그램", "올로맥스정20/5/10밀리그램", "로벨리토정150/20밀리그램", "하이드린캡슐", "딜라트렌에스알캡슐32밀리그램", "메녹틸정40밀리그램", "자이티가정500밀리그램", "보트리엔트정400밀리그램", "리피다운캡슐120mg", "일성이솦틴서방정240밀리그람", "네시나액트정25/15밀리그램", "몬테리진캡슐", "아모잘탄정10/50밀리그램", "동화디트로판정", "파마에스조피클론정1MG", "구주로라타딘정10밀리그람", "오바지오필름코팅정14밀리그램", "삼성팜시클로버정", "래반포르테주입크림", "에멘드캡슐80밀리그램", "더모픽스질정", "마이녹실액5%", "라미실크림1%", "이지에프새살연고", "나자린플러스분무액", "에멘드캡슐125밀리그램", "아그릴린캡슐0.5밀리그램", "유로시트라케이10MEQ서방정", "레미닐피알서방캡슐16밀리그램", "로벨리토정300/20밀리그램", "파텐션정20밀리그램", "원드론패취10", "레미닐피알서방캡슐24밀리그램", "아고틴정25밀리그램", "리스펜정1밀리그람", "타겐에프연질캡슐", "엑스포지정5/160밀리그램", "코아프로벨정150/12.5밀리그람", "트루다파엠서방정10/500밀리그램", "후메론점안액", "한독세로자트정10밀리그램", "오구멘틴정625밀리그램", "파나스카정", "레보펙신정", "디맥정7000아이유", "모빅캡슐15밀리그램", "가모틴정", "레더코트정", "휴마로그퀵펜주100단위/밀리리터", "메로겔", "클래라정", "이즈바점안액0.003%", "플루티폼흡입제125μG/5μG", "아뉴이티100엘립타", "페모스톤콘티정", "테라마이신안연고", "실크론지크림", "토브라점안액", "헤모렉스크림", "클로벡스샴푸 0.05%", "슈펙트캡슐200밀리그램", "졸로푸트정50밀리그람", "디아릴정3밀리그램", "라코르정120/12.5밀리그램", "리셀톤캡슐1.5MG", "리팜핀캅셀150밀리그람", "아트로벤트흡입액유디비", "스킬라렌스장용정120밀리그램", "큐시미아캡슐 15MG", "쿠에타핀정100밀리그램", "리바로젯정2/10밀리그램", "람노스산", "에트라빌25밀리그램정", "유한스프렌딜지속정5밀리그램", "콘트라브서방정", "디에타민 37.5mg", "루키오츄정4밀리그램", "로도질정", "뉴록사신정", "아세타졸정", "팜빅스정750밀리그램", "에스파손겔0.05%", "노스판패취20㎍/H", "페모스톤정2/10", "휴마로그주100단위/밀리리터", "케노펜겔", "휴물린엔주100단위이소판", "더모타손엠엘이로션", "수란트라크림1%", "로젝스겔0.75%", "나딕사크림10g", "니트로링구알스프레이", "아사콜디알정400밀리그람", "아리미덱스정", "프라닥사캡슐110밀리그램", "부광아데포비어정10밀리그램", "로벨리토정300/10밀리그램", "일성이솦틴정80밀리그램", "피알디현탁시럽0.1%", "오마코미니연질캡슐2그램", "프로그랍캅셀0.5밀리그람", "유한프레가발린서방정300밀리그램", "익셀캡슐50밀리그램", "에피언트정10밀리그램", "튜비스정", "세토펜현탁액", "베시케어정10밀리그램", "산디문뉴오랄연질캡슐25밀리그램", "옥시콘틴서방정20밀리그램", "옥시콘틴서방정40밀리그램", "큐시미아캡슐 11.25MG", "코비안에스시럽", "아모잘탄플러스정5/50/12.5밀리그램", "바크락스정200밀리그램", "쎄로켈정25밀리그램", "대원아미노필린정[", "싱귤레어츄정5밀리그램", "크린세프캡슐", "큐시미아캡슐 3.75MG", "루미간점안액0.01%", "본비바플러스정", "코솝점안액", "제로바액", "이솝토아트로핀1%점안제", "프라닥사캡슐150밀리그램", "히아레인미니점안액0.3%", "자디앙듀오정5/850밀리그램", "네오팻정200밀리그램", "라믹탈정25밀리그램", "일양하이트린정1밀리그램", "스킬라렌스장용정30밀리그램", "파이콤파필름코팅정4밀리그램", "씬지로이드정0.0375밀리그램", "자디텐시럽", "트리테이스프로텍트정", "가브스메트정50/1000밀리그램", "젤잔즈정5밀리그램", "마이오가드점안액0.125%", "미노씬캡슐50MG", "포리부틴드라이시럽", "듀아비브정0.45/20mg", "에이자트씨알정25밀리그램", "팔로델정", "삐콤씨", "모비락스산", "아사콜관장액4그람/100밀리리터", "미카르디스플러스정80/12.5밀리그램", "프로세질정250밀리그램", "미니스정0.2밀리그램", "록펜정", "스트렌정", "레보플러스정750밀리그램", "이미그란정50밀리그램", "자이데나200mg", "시클러캡슐250밀리그램", "휴물린70/30", "아좁트점안액", "심비코트라피헬러160/4.5마이크로그램", "듀악겔3% 30g", "엘더킨크림4%", "엔딕스크림", "데파킨크로노정300밀리그램", "듀락칸시럽", "보령부스파정10밀리그램", "명도파정25/100밀리그램", "슈펙트캡슐100밀리그램", "리셀톤캡슐3MG", "네시나액트정25/30밀리그램", "목시클시럽156.25MG/5ML", "카프릴정25MG", "토파맥스스프링클캡슐25밀리그램", "자렐토정10밀리그램", "사미온정30밀리그램", "일양하이트린정5밀리그람", "일양하이트린정2밀리그람", "푸로작캡슐20밀리그램", "제이티니스타틴시럽", "아빌리파이정2밀리그램", "록씨현탁액", "원드론패취15", "안프란서방정300밀리그램", "베넥사엑스알서방캡슐37.5밀리그램", "안플원서방정300밀리그램", "제로큐탄연질캡슐", "한일비타메진캅셀50MG", "디비겔0.1%", "브릴린타정90밀리그램", "타크로벨캡슐0.5밀리그램", "튜비스투정150/300밀리그램", "코푸정", "아나프록스정", "트라스트패취", "태준리도카인비스코스2%액", "크라비트정250밀리그람", "줄토피플렉스터치주", "트루리시티0.75밀리그램/0.5밀리리터일회용펜", "팔팔정 50mg", "크리멘28정", "리세토정150밀리그램", "크레오신티외용액1%", "아킨지오캡슐", "하이졸크림", "오르필시럽", "일성독시움정", "프로코라란정5밀리그램", "카마제핀씨알정300밀리그람", "스타레보필름코팅정100/25/200밀리그램", "맥시부펜시럽", "프라펙솔정0.125밀리그램", "칼테오-40정", "레스콜엑스엘서방정", "마도파확산정125", "렌비마캡슐4밀리그램", "울트라셋이알세미서방정", "리스페달정1밀리그램", "스프라이셀정20밀리그램", "트라클리어정62.5밀리그램", "스프라이셀정50밀리그램", "이레사정", "브린텔릭스정10밀리그램", "아토바미브정10/10밀리그램", "코디오반정80/12.5밀리그램", "업트라비정400마이크로그램", "쎄로켈서방정50밀리그램", "훼리탑캡슐", "스파스몰리트당의정", "아사콜좌약500밀리그람", "원드론패취5", "디클렉틴정", "미카르디스플러스정40/12.5밀리그램", "제미메트서방정25/1000밀리그램", "아리셉트정23밀리그램", "스티바가정40밀리그램", "오젝스정", "유레민정0.1밀리그램", "삼스카정15밀리그램", "미라베가서방정50밀리그램", "미가드정2.5MG", "카버락틴정", "구구츄정 20mg", "게그론캡슐", "후로목스정100밀리그램", "일화세파클러캡슐250밀리그램", "온세란정8MG", "리세닐정35밀리그램", "레버미어플렉스펜주100단위/밀리리터", "오팍신점안액", "포스테오주", "데타손연고0.25%", "엔스틸룸폼", "자미올겔", "유센스질크림", "로푸록스네일라카", "올로파점안액", "하이트리크림", "데파코트스프링클캅셀", "영진설트랄린정25밀리그램", "제이알히드로코르티손정", "파이콤파필름코팅정2밀리그램", "글루패스트정10밀리그램", "사일레노정3밀리그램", "글루코반스정500/2.5밀리그램", "아서틸아르기닌정5밀리그램", "카비드츄어블정", "미르탁스정15MG", "듀카브플러스정60/5/25밀리그램", "타크로벨캡슐0.25밀리그램", "아서틸아르기닌정10밀리그램", "푸리네톤정", "에피언트정5밀리그램", "올루미언트정2밀리그램", "코자정", "데파스정0.5밀리그람", "아미로정", "바스티난엠알서방정", "텔미누보정80/2.5밀리그램", "프로베라정5MG", "삼진디아제팜정5밀리그람", "스프라이셀정100밀리그램", "레보프라이드정", "환인벤즈트로핀정1밀리그램", "바이토린정10/20", "니트로푸란토인캡슐50mg", "코자플러스정", "트루다파엠서방정10/1000밀리그램", "테몰드캡슐100밀리그램", "스포라녹스캡슐", "테몰드캡슐20밀리그램", "메치손정", "모벨록신정400밀리그램", "뮤로128점안액5%", "멜라논크림 23G", "다이펜탈크림", "이소바이드액500ml", "나테스토나잘겔", "에피듀오겔0.1%", "에스와이무피로신나잘연고", "오라메디연고", "마도파에취비에스캅셀125", "인라이타정1밀리그램", "스타레보필름코팅정50/12.5/200밀리그램", "유리토스정", "헤파멜즈산", "아질렉트정", "명도파정50/200밀리그램", "리트모놈SR서방캡슐325밀리그램", "메디아벤엘정", "프라펙솔정0.25밀리그램", "박사르정6밀리그램", "넥사바정200밀리그램", "알카본정", "심바로드정40밀리그램", "알포콜린리드캡슐", "프로이머정", "인라이타정5밀리그램", "카멘정5밀리그람", "토비애즈서방정8밀리그람", "티에스원캡슐25", "다파프로정5밀리그램", "티비올정", "나도가드정40밀리그램", "삼스카정30밀리그램", "아로마신정25MG", "아빌리파이정1밀리그램", "심바티브정10/10", "케이토스정", "크레스토정10밀리그램", "프레탈서방캡슐", "테넬리아엠서방정10/500밀리그램", "다오닐정", "입랜스캡슐100MG", "발싸이트정450밀리그램", "비짐프로정45밀리그램", "비유피-4정20밀리그램", "자니딥정", "네비레트엠정2.5밀리그램", "노바스크정10밀리그램", "파마에스조피클론정2MG", "구구츄정 10mg", "나제론오디정0.1MG", "솔리쿠아펜주", "산디문뉴오랄연질캡슐100밀리그램", "프로베라정10MG", "엠빅스에스구강붕해필름 50mg", "아목사펜캡슐", "티니다진정500밀리그람", "비아그라50mg", "베포엠정10밀리그램", "에이베리스점안액0.002%", "인슈라타드HM주100단위/밀리리터", "구구정 20mg", "알러콘점안액", "세레타이드250디스커스", "헤르페시드안연고", "맥시트롤안연고", "아노렉스캡슐25밀리그램", "케프라액", "벤포렉스캡슐", "스타레보필름코팅정150/37.5/200밀리그램", "알타민캡슐250밀리그램", "소아용에보프림연질캡슐", "유로시트라씨산", "리큅정1밀리그램", "얼리다정", "프라펙솔서방정1.5밀리그램", "사브릴정500밀리그람", "메바로친정5밀리그램", "프라펙솔정0.5밀리그램", "종근당리마틸정", "베사노이드연질캡슐10밀리그램", "하드칼츄어블정", "로수바미브정10/5밀리그램", "삼진니모디핀정", "트렌탈서방정400", "알리톡연질캡슐30밀리그램", "하미돈엠정", "아모잘탄정5/100밀리그램", "유로픽스정", "아모디핀정5밀리그램", "데파스정1밀리그람", "넥실렌정[애엽이소프로판올연조엑스]", "몰시톤정2밀리그람", "구주스피로닥톤정", "자이프렉사자이디스확산정5밀리그램", "폴락스산 10 g", "놀바덱스정", "보트리엔트정200밀리그램", "레나라정", "카딜정2밀리그램", "리스펜정2밀리그람", "코대원포르테시럽", "카보메틱스정40밀리그램", "시알리스5mg", "유레민정0.2밀리그램", "그린 글리세린 에네마 30ml", "그리아정", "한독세로자트정20밀리그램", "알리톡연질캡슐10밀리그램", "에이자트씨알정12.5밀리그램", "카버락틴정1MG", "팔팔정 100mg", "황몰핀정", "올로원스점안액", "타미플루캡슐30밀리그램", "사미온정", "로스판정", "투리온정", "알보칠콘센트레이트액", "시알리스 20mg", "노보래피드주100단위/밀리리터", "맥시덱스점안액", "유락신연고", "오큐카르핀점안액2%", "다이악센크림", "네오덱스안연고", "노레보원정", "베루말액", "리노벤트비액", "한림호마핀점안액", "무조날크림", "엘칸정330밀리그램", "로바젯정10/20밀리그램", "셀라빅스정75밀리그램", "올로맥스정40/5/10밀리그램", "앱스트랄설하정400마이크로그램", "아빌리파이정15밀리그램", "프라펙솔정1밀리그램", "프리그렐정", "프라펙솔서방정0.75밀리그램", "프라펙솔서방정0.375밀리그램", "멜로시드캡슐7.5밀리그램", "넥실렌에스정[애엽이소프로판올연조엑스]", "본레일정,0.4054G/1정", "네비스톨정1.25밀리그램", "환인벤즈트로핀정", "아미티자연질캡술24ug", "베시보정", "제일로피드캡슐", "파이콤파필름코팅정6밀리그램", "시클러건조시럽125밀리그램/5밀리리터", "모다닐정200밀리그램", "프로비질정200밀리그램", "콤지로이드정", "자이프렉사정10밀리그램", "브레디닌정50밀리그람", "치옥타시드에이취알정600밀리그램", "웰부트린엑스엘정300밀리그램", "아서틸정4밀리그람", "현대제스트릴정10밀리그램", "메부톤정", "마이폴틱장용정180밀리그램", "글리닙정200밀리그램", "마하칸정8/5밀리그램", "명인피모짓1미리그람정", "타크로벨캡슐1밀리그램", "비오플캅셀", "엠빅스에스구강붕해필름100mg", "스타빅현탁액", "알키록산정", "아피니토정10밀리그램", "아큐베일점안액0.45%", "유한메트포르민서방정500MG", "유트로게스탄질좌제200mg", "글리닙정400밀리그램", "마그오캅셀500MG", "모사렌정", "지노베타딘질좌제", "페듀로우현탁액", "레록신정", "메디카세파클러캡슐250밀리그램", "스파민정", "록스로펜정", "니코챔스정 0.5MG", "에소듀오정20/800밀리그램", "디스토시드정", "영풍클로미펜시트르산염정", "설포라제캡슐", "멜라토서방정2mg", "메디락에스산", "액시드캡슐150밀리그람", "테몰드캡슐250밀리그램", "팔팔츄정25mg", "란투스주바이알", "피아스프플렉스터치주100단위/밀리리터", "후시메드연고", "더비솔액", "베타록정", "아크리프크림 0.005%", "산쿠소패취", "엘크라넬알파액0.025%", "실마진1%크림", "오자넥스크림", "파타데이0.2%점안액", "무조날외용액1%", "성광칼라민로오션", "타리비드안연고", "데타손로션0.25%", "박테로신연고", "베아로반연고"];

// 음성인식 결과와 약품명 유사도 계산 (초성/부분일치)
function findSimilarDrugs(transcript, limit = 3) {
  const t = transcript.replace(/\s/g, "").toLowerCase();
  const scored = DRUG_LIST.map(drug => {
    const d = drug.replace(/\s/g, "").toLowerCase();
    // 완전 포함
    if (d.includes(t) || t.includes(d.slice(0, 3))) return { drug, score: 3 };
    // 앞 2글자 일치
    if (d.startsWith(t.slice(0, 2))) return { drug, score: 2 };
    // 공통 글자 수
    let common = 0;
    for (const ch of t) { if (d.includes(ch)) common++; }
    return { drug, score: common / Math.max(t.length, 1) };
  });
  return scored
    .filter(s => s.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.drug);
}

const SESSION_LABEL  = { morning: "오전 주문", afternoon: "오후 주문" };
const SESSION_ICON   = { morning: "☀️", afternoon: "🌙" };
const SESSION_COLOR  = { morning: "#f59e0b", afternoon: "#6366f1" };
const STOCK_PRESETS  = ["1개 남음", "2개 남음", "3개 남음", "거의 소진", "재고 없음"];
const CATEGORY_COLOR = { handover: "#2563eb", notice: "#7c3aed", message: "#059669" };
const CATEGORY_BG    = { handover: "#eff6ff", notice: "#f5f3ff", message: "#f0fdf4" };

const iStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 10,
  border: "1.5px solid #e2e8f0", fontSize: 14, color: "#1e293b",
  background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

function isStockNote(val) { return val && isNaN(Number(val)); }

function QtyBadge({ value, done, mode }) {
  if (!value) return null;
  const stock = mode === "stock" || (mode !== "qty" && isStockNote(value));
  // "재고 없음", "1개 남음" 등 프리셋은 그대로, 숫자만 입력 시 "N개 남음" 형태로 표시
  const stockLabel = isNaN(Number(value)) ? value : value + "개 남음";
  if (done) return <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>{stock ? stockLabel : "수량 : " + value}</span>;
  if (stock) return (
    <span style={{ fontSize: 12, fontWeight: 700, borderRadius: 6, padding: "3px 8px",
      background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fca5a5",
      display: "inline-flex", alignItems: "center", gap: 3 }}>
      📦 {stockLabel}
    </span>
  );
  return (
    <span style={{ fontSize: 12, fontWeight: 700, borderRadius: 6, padding: "3px 8px",
      background: "#2563eb", color: "#fff", display: "inline-flex", alignItems: "center", gap: 3 }}>
      🛒 {value}개 주문 필요
    </span>
  );
}

function SessionSection({ session, items, onToggle, onDelete, onCheckAll, onEdit, sortOrder }) {
  // 긴급은 항상 맨 위, 그 다음 시간순 or 가나다순
  const sorted = [...items].sort((a, b) => {
    if (sortOrder === "alpha") {
      if (b.urgent !== a.urgent) return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
      return a.drug_name.localeCompare(b.drug_name, "ko");
    }
    // 시간순: 긴급 우선, 그 다음 등록 순서 고정 (완료해도 자리 안 바뀜)
    if (b.urgent !== a.urgent) return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
    return a.id - b.id;
  });
  const doneCount = items.filter(i => i.done).length;
  const allDone   = doneCount === items.length;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{SESSION_ICON[session]} {SESSION_LABEL[session]}</span>
        <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "2px 9px",
          background: allDone ? "#d1fae5" : "#f1f5f9", color: allDone ? "#059669" : "#64748b" }}>
          {allDone ? "완료" : doneCount + "/" + items.length}
        </span>

      </div>
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderTop: "3px solid " + SESSION_COLOR[session] }}>
        {sorted.map((item, idx) => (
          <div key={item.id} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "13px 14px",
            borderBottom: idx < sorted.length - 1 ? "1px solid #f1f5f9" : "none",
            borderLeft: item.urgent && !item.done ? "4px solid #f59e0b" : item.soldout ? "4px solid #94a3b8" : "4px solid transparent",
            background: item.soldout ? "#f8fafc" : item.urgent
              ? (item.done ? "#fefce8" : "#fff7ed")
              : "transparent",
          }}>
            <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id, item.done)}
              style={{ width: 20, height: 20, accentColor: "#2563eb", cursor: "pointer", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* 긴급/품절 뱃지 줄 */}
              {(item.urgent && !item.done && !item.soldout || item.soldout) && (
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  {item.urgent && !item.done && !item.soldout && (
                    <span style={{
                      fontSize: 11, fontWeight: 800, borderRadius: 6, padding: "2px 8px",
                      background: "#f59e0b", color: "#fff",
                      display: "inline-flex", alignItems: "center", gap: 3,
                    }}>🚨 긴급</span>
                  )}
                  {item.soldout && (
                    <span style={{
                      fontSize: 11, fontWeight: 800, borderRadius: 6, padding: "2px 8px",
                      background: "#64748b", color: "#fff",
                      display: "inline-flex", alignItems: "center", gap: 3,
                    }}>🚫 품절주문불가</span>
                  )}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{
                  fontWeight: 700, fontSize: 15,
                  color: item.soldout ? "#94a3b8" : item.done ? "#94a3b8" : (item.urgent ? "#92400e" : "#0f172a"),
                  textDecoration: item.done ? "line-through" : "none",
                }}>
                  {item.drug_name}
                </span>
                {item.pack_type === "ptp" && (
                  <span style={{ fontSize: 15, fontWeight: 700, borderRadius: 6, padding: "2px 7px",
                    background: "#eff6ff", color: "#2563eb", flexShrink: 0 }}>PTP</span>
                )}
                {item.pack_type === "bottle" && (
                  <span style={{ fontSize: 15, fontWeight: 700, borderRadius: 6, padding: "2px 7px",
                    background: "#f5f3ff", color: "#7c3aed", flexShrink: 0 }}>
                    {item.bottle_size ? item.bottle_size + " 병" : "병"}
                  </span>
                )}
              </div>
              <div style={{ marginTop: 4 }}>
                <QtyBadge value={item.quantity} done={item.done} mode={item.qty_mode} />
              </div>
            </div>
            <span style={{ fontSize: 11, color: "#b0bec5", flexShrink: 0 }}>{item.created_at}</span>
            <button onClick={() => onEdit(item)} className="btn"
              style={{ padding: "4px 8px", borderRadius: 7, background: "#eff6ff", color: "#2563eb",
                fontSize: 11, fontWeight: 700, border: "none", flexShrink: 0 }}>수정</button>
            <button onClick={() => onDelete(item.id)} className="btn"
              style={{ padding: "4px 8px", borderRadius: 7, background: "#fef2f2", color: "#ef4444",
                fontSize: 11, fontWeight: 700, border: "none", flexShrink: 0 }}>삭제</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [orders, setOrders]               = useState([]);
  const [handovers, setHandovers]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filterDate, setFilterDate]       = useState(getToday());
  const [filterSession, setFilterSession] = useState(getCurrentSession());
  const [sortOrder, setSortOrder]         = useState("time"); // "time" | "alpha"
  const [addingSession, setAddingSession] = useState(null);
  const [editId, setEditId]               = useState(null);
  const [qtyMode, setQtyMode]             = useState("qty");
  const [drugName, setDrugName]           = useState("");
  const [quantity, setQuantity]           = useState("");
  const [isUrgent, setIsUrgent]           = useState(false);
  const [isSoldOut, setIsSoldOut]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]                 = useState(null);
  const [activeTab, setActiveTab]         = useState("order");
  const [hoDate, setHoDate]               = useState(getToday());
  const [hoAuthor, setHoAuthor]           = useState("");
  const [hoCategory, setHoCategory]       = useState("handover");
  const [hoPriority, setHoPriority]       = useState("normal");
  const [hoContent, setHoContent]         = useState("");
  const [showHoForm, setShowHoForm]       = useState(false);
  const [editHoId, setEditHoId]           = useState(null);
  const [isListening, setIsListening]     = useState(false);
  const [packType, setPackType]           = useState(""); // "" | "ptp" | "bottle"
  const [bottleSize, setBottleSize]       = useState("");
  const [suggestions, setSuggestions]     = useState([]);
  const recognitionRef                    = useRef(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 1800); };

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [o, h] = await Promise.all([
        api("orders", "GET", null, "?order=created_date.desc"),
        api("handovers", "GET", null, "?order=created_date.desc"),
      ]);
      const orders = Array.isArray(o) ? o : [];
      const today = getToday();
      const currentSession = getCurrentSession();

      // 이월 처리: 미완료+미품절 주문이 오늘 날짜/세션이 아니면 오늘로 이월
      const toCarryOver = orders.filter(order =>
        !order.done && !order.soldout &&
        (order.date !== today || order.session !== currentSession)
      );
      if (toCarryOver.length > 0) {
        const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
        await Promise.all(toCarryOver.map(order =>
          api("orders", "PATCH", {
            date: today,
            session: currentSession,
            created_at: timeStr,
          }, `?id=eq.${order.id}`)
        ));
        // 이월 후 다시 불러오기
        const updated = await api("orders", "GET", null, "?order=created_date.desc");
        setOrders(Array.isArray(updated) ? updated : []);
      } else {
        setOrders(orders);
      }
      setHandovers(Array.isArray(h) ? h : []);
    } catch(e) { showToast("데이터 로딩 실패"); }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const timer = setInterval(() => fetchAll(true), 60000);
    return () => clearInterval(timer);
  }, [fetchAll]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFilterDate(getToday());
      setFilterSession(getCurrentSession());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 음성인식 함수
  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("이 브라우저는 음성인식을 지원하지 않아요 (Chrome 권장)");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      const match = transcript.match(/^(.+?)\s+(\d+)\s*개?$/);
      const spokenName = match ? match[1].trim() : transcript;
      const spokenQty = match ? match[2] : "";
      // 유사한 약품 찾기
      const similar = findSimilarDrugs(spokenName);
      if (similar.length > 0) {
        // 자동완성 목록으로 띄우기
        setSuggestions(similar);
        setDrugName(spokenName);
        if (spokenQty) setQuantity(spokenQty);
        showToast(`🎤 "${spokenName}" → 아래에서 선택해주세요`);
      } else {
        setDrugName(spokenName);
        if (spokenQty) setQuantity(spokenQty);
        showToast(`🎤 "${spokenName}"`);
      }
      setIsListening(false);
    };
    recognition.onerror = () => {
      showToast("음성인식 실패, 다시 시도해주세요");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  function openForm(session) {
    if (addingSession === session && !editId) { setAddingSession(null); return; }
    setEditId(null); setAddingSession(session); setQtyMode("qty");
    setDrugName(""); setQuantity(""); setIsUrgent(false); setIsSoldOut(false); setSuggestions([]); setPackType(""); setBottleSize("");
  }
  function openEdit(item) {
    setEditId(item.id); setAddingSession(item.session);
    setQtyMode(item.qty_mode || (isStockNote(item.quantity) ? "stock" : "qty"));
    setDrugName(item.drug_name); setQuantity(item.quantity);
    setIsUrgent(item.urgent || false);
    setIsSoldOut(item.soldout || false);
    setPackType(item.pack_type || "");
    setBottleSize(item.bottle_size || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    if (!drugName.trim() || !quantity.trim()) return;
    const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    if (editId) {
      await api("orders", "PATCH", {
        drug_name: drugName.trim(), quantity: quantity.trim(), qty_mode: qtyMode, urgent: isUrgent, soldout: isSoldOut, pack_type: packType, bottle_size: bottleSize
      }, `?id=eq.${editId}`);
      showToast("수정되었습니다");
    } else {
      await api("orders", "POST", {
        id: Date.now(), date: filterDate, session: addingSession,
        drug_name: drugName.trim(), quantity: quantity.trim(), qty_mode: qtyMode,
        urgent: isUrgent, soldout: false, pack_type: packType, bottle_size: bottleSize, done: false, created_at: timeStr,
      });
      showToast("주문이 등록되었습니다");
    }
    setDrugName(""); setQuantity(""); setAddingSession(null); setEditId(null); setIsUrgent(false); setIsSoldOut(false); setSuggestions([]); setPackType(""); setBottleSize("");
    fetchAll();
  }

  async function toggleDone(id, done) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, done: !done } : o));
    api("orders", "PATCH", { done: !done }, `?id=eq.${id}`);
  }
  async function toggleSoldOut(id, soldout) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, soldout: !soldout } : o));
    api("orders", "PATCH", { soldout: !soldout }, `?id=eq.${id}`);
  }
  async function deleteOrder(id) {
    setOrders(prev => prev.filter(o => o.id !== id));
    setConfirmDelete(null); showToast("삭제되었습니다");
    api("orders", "DELETE", null, `?id=eq.${id}`);
  }
  async function checkAll(session, done) {
    setOrders(prev => prev.map(o =>
      o.date === filterDate && o.session === session ? { ...o, done } : o
    ));
    showToast(done ? "일괄 완료 처리했습니다" : "완료를 취소했습니다");
    api("orders", "PATCH", { done }, `?date=eq.${filterDate}&session=eq.${session}`);
  }

  async function handleHoSave() {
    if (!hoAuthor.trim() || !hoContent.trim()) return;
    const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    if (editHoId) {
      await api("handovers", "PATCH", {
        author: hoAuthor.trim(), category: hoCategory, priority: hoPriority, content: hoContent.trim()
      }, `?id=eq.${editHoId}`);
      showToast("수정되었습니다");
    } else {
      await api("handovers", "POST", {
        id: Date.now(), date: hoDate, author: hoAuthor.trim(),
        category: hoCategory, priority: hoPriority, content: hoContent.trim(),
        checked: false, created_at: timeStr,
      });
      showToast("등록되었습니다");
    }
    setHoContent(""); setShowHoForm(false); setEditHoId(null); fetchAll();
  }
  async function toggleHoChecked(id, checked) {
    await api("handovers", "PATCH", { checked: !checked }, `?id=eq.${id}`);
    fetchAll();
  }
  async function deleteHo(id) {
    await api("handovers", "DELETE", null, `?id=eq.${id}`);
    showToast("삭제되었습니다"); fetchAll();
  }
  function openEditHo(item) {
    setEditHoId(item.id); setHoAuthor(item.author); setHoCategory(item.category);
    setHoPriority(item.priority); setHoContent(item.content); setShowHoForm(true);
  }

  const filtered    = orders.filter(o => o.date === filterDate && (filterSession === "all" || o.session === filterSession));
  const morning     = filtered.filter(o => o.session === "morning");
  const afternoon   = filtered.filter(o => o.session === "afternoon");
  const doneCount   = filtered.filter(o => o.done).length;
  const accentColor = addingSession ? SESSION_COLOR[addingSession] : "#2563eb";
  const filteredHo  = handovers.filter(h => h.date === hoDate);
  const uncheckedHo = handovers.filter(h => !h.checked).length;

  return (
    <div style={{ fontFamily: "Noto Sans KR, sans-serif", background: "#f5f7fa", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .btn { transition: opacity 0.15s, transform 0.1s; cursor: pointer; border: none; font-family: inherit; }
        .btn:hover { opacity: 0.88; } .btn:active { transform: scale(0.97); }
        .fade { animation: fadeUp 0.2s ease; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        .toast-anim { animation: toastIn 0.25s ease; }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes micPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); } 50% { box-shadow: 0 0 0 7px rgba(239,68,68,0); } }
      `}</style>

      {/* 헤더 */}
      <div style={{ background: "#1e3a5f", padding: "16px 20px 14px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 24 }}>💊</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>약국 주문장</div>
              <div style={{ color: "#93c5fd", fontSize: 11, marginTop: 1 }}>{getTodayLabel()}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {activeTab === "order" && filtered.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "5px 13px", color: "#e0f2fe", fontSize: 12, fontWeight: 600 }}>
                {doneCount}/{filtered.length} 완료
              </div>
            )}
            <button onClick={fetchAll} className="btn"
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 20, padding: "5px 10px", color: "#e0f2fe", fontSize: 12, fontWeight: 600 }}>
              🔄 새로고침
            </button>
          </div>
        </div>
      </div>

      {/* 메인 탭 */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex" }}>
          <button onClick={() => setActiveTab("order")} className="btn"
            style={{ flex: 1, padding: "12px 0", fontSize: 14, fontWeight: 700,
              background: "transparent", color: "#1e3a5f",
              borderBottom: "2px solid #1e3a5f" }}>
            📋 주문장
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "14px 14px 80px" }}>

        {/* 로딩 */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: 13 }}>불러오는 중...</div>
          </div>
        )}

        {/* ===== 주문장 탭 ===== */}
        {!loading && activeTab === "order" && (
          <div>
            {/* 날짜 / 세션 필터 */}
            <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 12,
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                style={{ ...iStyle, flex: 1, minWidth: 130, width: "auto" }} />
              <div style={{ display: "flex", gap: 6 }}>
                {[["all","전체"],["morning","☀️ 오전"],["afternoon","🌙 오후"]].map(([val, label]) => (
                  <button key={val} onClick={() => setFilterSession(val)} className="btn"
                    style={{ padding: "7px 11px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                      background: filterSession === val ? "#1e3a5f" : "#f1f5f9",
                      color: filterSession === val ? "#fff" : "#64748b" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 정렬 버튼 + 주문 추가 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>정렬</span>
                {[["time","🕐 시간순"],["alpha","가나다순"]].map(([val, label]) => (
                  <button key={val} onClick={() => setSortOrder(val)} className="btn"
                    style={{ padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: sortOrder === val ? "#1e3a5f" : "#f1f5f9",
                      color: sortOrder === val ? "#fff" : "#64748b" }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => {
                  // 메인 🎤: 폼 열고 바로 음성인식 시작
                  if (!addingSession) openForm(getCurrentSession());
                  setTimeout(() => startListening(), 300);
                }} className="btn"
                  style={{ padding: "7px 14px", borderRadius: 20, fontWeight: 700, fontSize: 16,
                    background: isListening ? "#ef4444" : "#e0f2fe",
                    color: isListening ? "#fff" : "#2563eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    animation: isListening ? "micPulse 1s infinite" : "none" }}>
                  🎤
                </button>
                <button onClick={() => openForm(getCurrentSession())} className="btn"
                  style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13,
                    background: addingSession ? SESSION_COLOR[addingSession] : "#1e3a5f",
                    color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                  + 주문 추가
                </button>
              </div>
            </div>

            {addingSession && (
              <div className="fade" style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 14,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderTop: "3px solid " + accentColor }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: accentColor }}>
                    {editId ? "✏️ 주문 수정" : SESSION_ICON[addingSession] + " " + SESSION_LABEL[addingSession] + " 주문 등록"}
                  </div>
                  <button onClick={() => setIsUrgent(!isUrgent)} className="btn"
                    style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                      border: "1.5px solid " + (isUrgent ? "#f59e0b" : "#e2e8f0"),
                      background: isUrgent ? "#fff7ed" : "#f8fafc",
                      color: isUrgent ? "#d97706" : "#94a3b8" }}>
                    {isUrgent ? "🚨 긴급 ✓" : "🚨 긴급"}
                  </button>
                </div>

                {/* 약품명 입력 + 🎤 마이크 버튼 */}
                <div style={{ position: "relative", marginBottom: 10 }}>
                  <input
                    autoFocus
                    placeholder="약품명 (2글자 이상 입력시 자동완성)"
                    value={drugName}
                    onChange={e => {
                      const val = e.target.value;
                      setDrugName(val);
                      if (val.length >= 2) {
                        const filtered = DRUG_LIST.filter(d => d.includes(val)).slice(0, 6);
                        setSuggestions(filtered);
                      } else {
                        setSuggestions([]);
                      }
                    }}
                    onKeyDown={e => e.key === "Enter" && document.getElementById("qty-input")?.focus()}
                    onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                    style={{ ...iStyle, paddingRight: 48 }}
                  />
                  {suggestions.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                      background: "#fff", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                      border: "1.5px solid #e2e8f0", overflow: "hidden", marginTop: 4 }}>
                      {suggestions.map((s, i) => (
                        <div key={i} onClick={() => { setDrugName(s); setSuggestions([]); document.getElementById("qty-input")?.focus(); }}
                          style={{ padding: "10px 14px", fontSize: 14, cursor: "pointer", color: "#1e293b",
                            borderBottom: i < suggestions.length - 1 ? "1px solid #f1f5f9" : "none",
                            background: "#fff" }}
                          onMouseEnter={e => e.target.style.background = "#f0f9ff"}
                          onMouseLeave={e => e.target.style.background = "#fff"}>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={startListening}
                    className="btn"
                    title={isListening ? "듣는 중... (탭하여 중지)" : "음성으로 약품명 입력"}
                    style={{
                      position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                      width: 34, height: 34, borderRadius: "50%", border: "none",
                      background: isListening ? "#ef4444" : "#e0f2fe",
                      color: isListening ? "#fff" : "#2563eb",
                      fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center",
                      animation: isListening ? "micPulse 1s infinite" : "none",
                      flexShrink: 0,
                    }}
                  >
                    🎤
                  </button>
                </div>

                {/* 듣는 중 안내 텍스트 */}
                {isListening && (
                  <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 8,
                    display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                      background: "#ef4444", animation: "micPulse 1s infinite" }} />
                    듣고 있어요... 약품명을 말해주세요
                  </div>
                )}

                {editId && (
                  <button onClick={() => setIsSoldOut(!isSoldOut)} className="btn"
                    style={{ width: "100%", padding: "9px", borderRadius: 10, marginBottom: 10,
                      fontWeight: 700, fontSize: 13, border: "1.5px solid " + (isSoldOut ? "#64748b" : "#e2e8f0"),
                      background: isSoldOut ? "#f1f5f9" : "#f8fafc",
                      color: isSoldOut ? "#1e293b" : "#94a3b8" }}>
                    {isSoldOut ? "🚫 품절 ✓" : "🚫 품절"}
                  </button>
                )}
                {/* PTP / 병 선택 */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: packType === "bottle" ? 8 : 0 }}>
                    {[["ptp","PTP"],["bottle","병"]].map(([val, label]) => (
                      <button key={val} onClick={() => { setPackType(packType === val ? "" : val); setBottleSize(""); }} className="btn"
                        style={{ flex: 1, padding: "7px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                          border: "1.5px solid " + (packType === val ? accentColor : "#e2e8f0"),
                          background: packType === val ? accentColor + "18" : "#f8fafc",
                          color: packType === val ? accentColor : "#94a3b8" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {packType === "bottle" && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {["28t","30t","60t","90t","100t","200t","300t","500t","1000t"].map(size => (
                        <button key={size} onClick={() => setBottleSize(size)} className="btn"
                          style={{ padding: "5px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            border: "1.5px solid " + (bottleSize === size ? "#059669" : "#e2e8f0"),
                            background: bottleSize === size ? "#f0fdf4" : "#f8fafc",
                            color: bottleSize === size ? "#059669" : "#64748b" }}>
                          {size}
                        </button>
                      ))}
                      <input placeholder="직접입력" value={!["28t","30t","60t","90t","100t","200t","300t","500t","1000t"].includes(bottleSize) ? bottleSize : ""}
                        onChange={e => setBottleSize(e.target.value)}
                        style={{ ...iStyle, width: 80, padding: "5px 8px", fontSize: 12 }} />
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {[["qty","📦 주문수량입력"],["stock","⚠️ 현재재고입력"]].map(([m, label]) => (
                    <button key={m} onClick={() => { setQtyMode(m); if (!editId) setQuantity(""); }} className="btn"
                      style={{ flex: 1, padding: "7px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                        border: "1.5px solid " + (qtyMode === m ? accentColor : "#e2e8f0"),
                        background: qtyMode === m ? accentColor + "18" : "#f8fafc",
                        color: qtyMode === m ? accentColor : "#94a3b8" }}>
                      {label}
                    </button>
                  ))}
                </div>
                {qtyMode === "qty" && (
                  <input id="qty-input" placeholder="수량 입력 (예: 3, 2box)" value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSave()}
                    style={{ ...iStyle, marginBottom: 10 }} />
                )}
                {qtyMode === "stock" && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {STOCK_PRESETS.map(preset => (
                        <button key={preset} onClick={() => setQuantity(preset)} className="btn"
                          style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            border: "1.5px solid " + (quantity === preset ? "#c2410c" : "#e2e8f0"),
                            background: quantity === preset ? "#fff7ed" : "#f8fafc",
                            color: quantity === preset ? "#c2410c" : "#64748b" }}>
                          {preset}
                        </button>
                      ))}
                    </div>
                    <input id="qty-input" placeholder="직접 입력 (예: 반박스 남음)" value={quantity}
                      onChange={e => setQuantity(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSave()}
                      style={iStyle} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setAddingSession(null); setDrugName(""); setQuantity(""); setEditId(null); setIsUrgent(false); setIsSoldOut(false); }} className="btn"
                    style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#f1f5f9", color: "#64748b", fontWeight: 600, fontSize: 14 }}>
                    취소
                  </button>
                  <button onClick={handleSave} className="btn"
                    style={{ flex: 2, padding: "10px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                      background: drugName.trim() && quantity.trim() ? accentColor : "#e2e8f0",
                      color: drugName.trim() && quantity.trim() ? "#fff" : "#94a3b8" }}>
                    {editId ? "수정 완료" : "등록"}
                  </button>
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "52px 0", color: "#94a3b8" }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>📋</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>주문 내역이 없습니다</div>
                <div style={{ fontSize: 12, marginTop: 5 }}>위 버튼으로 주문을 등록해보세요</div>
              </div>
            ) : (
              <div>
                {(filterSession === "all" || filterSession === "morning") && morning.length > 0 &&
                  <SessionSection session="morning" items={morning} onToggle={toggleDone} onDelete={setConfirmDelete} onCheckAll={checkAll} onEdit={openEdit} sortOrder={sortOrder} />}
                {(filterSession === "all" || filterSession === "afternoon") && afternoon.length > 0 &&
                  <SessionSection session="afternoon" items={afternoon} onToggle={toggleDone} onDelete={setConfirmDelete} onCheckAll={checkAll} onEdit={openEdit} sortOrder={sortOrder} />}
              </div>
            )}
          </div>
        )}

        {/* ===== 인수인계 탭 ===== */}
        {!loading && activeTab === "handover" && (
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
              <input type="date" value={hoDate} onChange={e => setHoDate(e.target.value)}
                style={{ ...iStyle, flex: 1, width: "auto" }} />
              <button onClick={() => { setEditHoId(null); setHoContent(""); setShowHoForm(!showHoForm); }} className="btn"
                style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13,
                  background: showHoForm ? "#64748b" : "#1e3a5f", color: "#fff", flexShrink: 0 }}>
                {showHoForm ? "닫기" : "+ 작성"}
              </button>
            </div>

            {showHoForm && (
              <div className="fade" style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 14,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderTop: "3px solid #1e3a5f" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f", marginBottom: 12 }}>
                  {editHoId ? "✏️ 수정" : "📝 인수인계 작성"}
                </div>
                <input placeholder="작성자 이름" value={hoAuthor} onChange={e => setHoAuthor(e.target.value)}
                  style={{ ...iStyle, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 5 }}>카테고리</div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {[["handover","인수인계"],["notice","공지"],["message","전달사항"]].map(([c, label]) => (
                        <button key={c} onClick={() => setHoCategory(c)} className="btn"
                          style={{ flex: 1, padding: "5px 2px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                            border: "1.5px solid " + (hoCategory === c ? CATEGORY_COLOR[c] : "#e2e8f0"),
                            background: hoCategory === c ? CATEGORY_BG[c] : "#f8fafc",
                            color: hoCategory === c ? CATEGORY_COLOR[c] : "#94a3b8" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 5 }}>중요도</div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {[["normal","일반"],["urgent","긴급"]].map(([p, label]) => (
                        <button key={p} onClick={() => setHoPriority(p)} className="btn"
                          style={{ flex: 1, padding: "5px 2px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                            border: "1.5px solid " + (hoPriority === p ? (p === "urgent" ? "#dc2626" : "#2563eb") : "#e2e8f0"),
                            background: hoPriority === p ? (p === "urgent" ? "#fef2f2" : "#eff6ff") : "#f8fafc",
                            color: hoPriority === p ? (p === "urgent" ? "#dc2626" : "#2563eb") : "#94a3b8" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <textarea placeholder="내용을 입력하세요..." value={hoContent}
                  onChange={e => setHoContent(e.target.value)} rows={4}
                  style={{ ...iStyle, resize: "none", lineHeight: 1.6, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setShowHoForm(false); setEditHoId(null); setHoContent(""); }} className="btn"
                    style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#f1f5f9", color: "#64748b", fontWeight: 600, fontSize: 14 }}>
                    취소
                  </button>
                  <button onClick={handleHoSave} className="btn"
                    style={{ flex: 2, padding: "10px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                      background: hoAuthor.trim() && hoContent.trim() ? "#1e3a5f" : "#e2e8f0",
                      color: hoAuthor.trim() && hoContent.trim() ? "#fff" : "#94a3b8" }}>
                    {editHoId ? "수정 완료" : "등록"}
                  </button>
                </div>
              </div>
            )}

            {filteredHo.length === 0 ? (
              <div style={{ textAlign: "center", padding: "52px 0", color: "#94a3b8" }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>📝</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>작성된 내용이 없습니다</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredHo.map(item => (
                  <div key={item.id} className="fade" style={{ background: "#fff", borderRadius: 14, padding: "14px 16px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    borderLeft: "3px solid " + (item.priority === "urgent" ? "#dc2626" : CATEGORY_COLOR[item.category]),
                    opacity: item.checked ? 0.55 : 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <input type="checkbox" checked={item.checked} onChange={() => toggleHoChecked(item.id, item.checked)}
                        style={{ width: 18, height: 18, accentColor: "#1e3a5f", cursor: "pointer", marginTop: 2, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                          {item.priority === "urgent" && (
                            <span style={{ fontSize: 11, fontWeight: 700, background: "#fef2f2", color: "#dc2626",
                              border: "1px solid #fca5a5", borderRadius: 20, padding: "2px 8px" }}>🚨 긴급</span>
                          )}
                          <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "2px 8px",
                            background: CATEGORY_BG[item.category], color: CATEGORY_COLOR[item.category] }}>
                            {item.category === "handover" ? "인수인계" : item.category === "notice" ? "공지" : "전달사항"}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{item.author}</span>
                          <span style={{ fontSize: 11, color: "#b0bec5", marginLeft: "auto" }}>{item.created_at}</span>
                        </div>
                        <div style={{ fontSize: 14, color: item.checked ? "#94a3b8" : "#1e293b",
                          lineHeight: 1.6, textDecoration: item.checked ? "line-through" : "none", whiteSpace: "pre-wrap" }}>
                          {item.content}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 10 }}>
                      <button onClick={() => openEditHo(item)} className="btn"
                        style={{ padding: "4px 10px", borderRadius: 7, background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 700, border: "none" }}>
                        수정
                      </button>
                      <button onClick={() => deleteHo(item.id)} className="btn"
                        style={{ padding: "4px 10px", borderRadius: 7, background: "#fef2f2", color: "#ef4444", fontSize: 11, fontWeight: 700, border: "none" }}>
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="fade" style={{ background: "#fff", borderRadius: 16, padding: "24px 20px",
            width: 270, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>🗑</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 5 }}>삭제할까요?</div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 18 }}>삭제 후 복구할 수 없습니다.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(null)} className="btn"
                style={{ flex: 1, padding: 10, borderRadius: 10, background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>취소</button>
              <button onClick={() => deleteOrder(confirmDelete)} className="btn"
                style={{ flex: 1, padding: 10, borderRadius: 10, background: "#ef4444", color: "#fff", fontWeight: 700 }}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div className="toast-anim" style={{ position: "fixed", bottom: 26, left: "50%",
          transform: "translateX(-50%)", background: "#1e293b", color: "#fff",
          padding: "10px 22px", borderRadius: 30, fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)", zIndex: 300, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
