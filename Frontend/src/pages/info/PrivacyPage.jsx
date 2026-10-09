import InfoPage, { InlineLink, List, Missing, SubHeading } from './InfoPage';

// Draft privacy policy. It describes what the code does today: the data model and API
// (Backend/Goodreads.*), the email, AI and hosting configuration (docker-compose.yml,
// Infrastructure/DependencyInjection.cs) and the frontend's browser storage (context/AuthContext.jsx).
// Facts only the owner can supply are marked with <Missing>. Update this text whenever data handling
// changes.

const sections = [
  {
    id: 'cavabdeh',
    title: 'Məlumatlara kim cavabdehdir',
    body: (
      <p>
        Bookla platformasında (bookla.org) şəxsi məlumatlarının emalına{' '}
        <Missing>şirkətin və ya fərdi sahibkarın rəsmi adı</Missing>, <Missing>hüquqi ünvan</Missing> cavabdehdir.
        Məxfiliklə bağlı suallar üçün: <Missing>əlaqə e-poçt ünvanı</Missing>.
      </p>
    ),
  },
  {
    id: 'toplanan',
    title: 'Hansı məlumatları toplayırıq',
    body: (
      <>
        <SubHeading>Qeydiyyat zamanı</SubHeading>
        <p>
          Ad, soyad, istifadəçi adı, e-poçt ünvanı və şifrə. Şifrə açıq şəkildə saxlanılmır: o, birtərəfli heş (hash)
          kimi saxlanılır.
        </p>
        <SubHeading>Profilinə əlavə etdiklərin (könüllü)</SubHeading>
        <p>Profil şəkli, bio, ölkə, doğum tarixi, veb sayt, Facebook, X (Twitter) və LinkedIn keçidləri.</p>
        <SubHeading>Platformadan istifadə zamanı</SubHeading>
        <List
          items={[
            'rəflərin və onlardakı kitablar, o cümlədən hansı kitabı oxumaq istədiyin, oxuduğun və oxuyub bitirdiyin;',
            'qiymətlərin, rəylərin, sitatların, şərhlərin və bəyənmələrin;',
            'izlədiyin və səni izləyən istifadəçilər;',
            'illik oxu hədəfin;',
            'şəxsi mesajların, onların göndərilmə və oxunma vaxtı;',
            'sənə göndərilən bildirişlər;',
            'Rəy (Feedback) bölməsinə göndərdiyin mesajlar;',
            'süni intellekt tövsiyələri üçün yazdığın sorğu mətni.',
          ]}
        />
        <SubHeading>Texniki məlumatlar</SubHeading>
        <List
          items={[
            'Server sistem jurnallarında (loglarda) giriş üçün istifadə etdiyin istifadəçi adı və ya e-poçt ünvanı, istifadəçi identifikatorun və bəzi əməliyyatların vaxtı qeydə alınır.',
            <>
              Veb serverin sorğular haqqında saxladığı texniki jurnalların (məsələn, IP ünvanı, brauzer, açılan ünvan və
              vaxt) tərkibi: <Missing>server konfiqurasiyasına əsasən təsdiqlənməlidir</Missing>.
            </>,
            'Platformaya daxil olduğun müddətdə onlayn olduğun digər daxil olmuş istifadəçilərə göstərilir. Bu məlumat yalnız serverin yaddaşında saxlanılır.',
          ]}
        />
        <p>
          Ödəniş məlumatı toplamırıq. Bookla reklam göstərmir, analitika və ya izləmə alətlərindən istifadə etmir.
        </p>
      </>
    ),
  },
  {
    id: 'meqsedler',
    title: 'Məlumatlardan necə istifadə edirik',
    body: (
      <>
        <List
          items={[
            'hesabını yaratmaq, səni tanımaq və hesabına girişi təmin etmək;',
            'e-poçt ünvanını təsdiqləmək və şifrəni bərpa etmək üçün məktub göndərmək — başqa məktublar, o cümlədən reklam məktubları göndərmirik;',
            'profilini, rəflərini, rəy və sitatlarını digər istifadəçilərə göstərmək, sosial axını və bildirişləri yaratmaq;',
            'şəxsi mesajları çatdırmaq;',
            'süni intellekt tövsiyələri səhifəsini açdıqda sənə kitab tövsiyələri hazırlamaq;',
            'Rəy (Feedback) mesajlarına baxmaq, qaydaların pozulmasının qarşısını almaq və platformanın işini təmin etmək.',
          ]}
        />
        <p>
          Məlumatların emalının hüquqi əsasları: <Missing>tətbiq olunan qanunvericiliyə uyğun müəyyənləşdirilməlidir</Missing>.
        </p>
      </>
    ),
  },
  {
    id: 'gorunurluk',
    title: 'Məlumatlarını kim görə bilər',
    body: (
      <>
        <SubHeading>Digər istifadəçilər</SubHeading>
        <p>
          Profilin açıqdır: ad, soyad, istifadəçi adı, profil şəkli, bio, ölkə, doğum tarixi (əlavə etmisənsə), veb sayt
          və sosial şəbəkə keçidləri, qeydiyyat tarixi. Rəflərin və onlardakı kitablar, qiymət və rəylərin, sitatların,
          şərhlərin, bəyənmələrin, izləyənlərin və izlədiklərin, sosial axındakı fəaliyyətin və illik oxu hədəfin də
          digər istifadəçilərə görünür. Bu məlumatların bir hissəsi platformaya daxil olmayan şəxslər üçün də əlçatandır.
        </p>
        <p>
          E-poçt ünvanının kimə görünəcəyi: <Missing>sahibkar təsdiqləməlidir</Missing>.
        </p>
        <SubHeading>Şəxsi mesajlar</SubHeading>
        <p>Yalnız sən və həmsöhbətin görürsünüz. Onlayn olduğun platformaya daxil olmuş digər istifadəçilərə görünür.</p>
        <SubHeading>Administratorlar</SubHeading>
        <p>
          Bookla administratorları istifadəçilərin hesab məlumatlarını (ad, soyad, istifadəçi adı, e-poçt ünvanı) görə
          və dəyişə, hesabları və rəyləri silə, Rəy (Feedback) bölməsinə göndərilən mesajları oxuya bilərlər.
        </p>
      </>
    ),
  },
  {
    id: 'oturme',
    title: 'Məlumatları kimlərə ötürürük',
    body: (
      <>
        <p>
          Məlumatlarını satmırıq və reklam məqsədilə heç kimə ötürmürük. Xidməti təqdim etmək üçün aşağıdakı xidmət
          təminatçılarından istifadə edirik:
        </p>
        <List
          items={[
            <>
              <strong className="font-semibold">Amazon Web Services (AWS)</strong> — server: verilənlər bazası və yüklənən
              şəkillər daxil olmaqla bütün məlumatlar AWS-də yerləşən serverimizdə saxlanılır. Server regionu:{' '}
              <Missing>AWS regionu</Missing>.
            </>,
            <>
              <strong className="font-semibold">SendGrid</strong> — e-poçt göndərilməsi: e-poçt ünvanın, istifadəçi adın
              və təsdiq və ya şifrə bərpası keçidi.
            </>,
            <>
              <strong className="font-semibold">OpenAI</strong> — süni intellekt tövsiyələri: 4 və 5 ulduzla
              qiymətləndirdiyin kitabların adları, oxuyub bitirdiyin kitabların adları və yazdığın sorğu mətni. Adın,
              e-poçt ünvanın və istifadəçi identifikatorun ötürülmür; tövsiyələr saxlanılmır.
            </>,
            <>
              <strong className="font-semibold">Open Library</strong> — kitab üz qabıqları: bəzi üz qabıqları brauzerin
              tərəfindən birbaşa covers.openlibrary.org saytından yüklənir, buna görə Open Library IP ünvanını və
              brauzer məlumatını görə bilər.
            </>,
          ]}
        />
        <p>
          Bu təminatçıların məlumatları emal etdiyi ölkələr və onlarla bağlanmış müqavilələr:{' '}
          <Missing>sahibkar təsdiqləməlidir</Missing>.
        </p>
      </>
    ),
  },
  {
    id: 'brauzer',
    title: 'Brauzerdə saxlanan məlumatlar',
    body: (
      <p>
        Bookla kuki (cookie) fayllarından istifadə etmir. Daxil olduqda brauzerinin yerli yaddaşında (localStorage)
        giriş tokenləri və hesabının əsas məlumatları (identifikator, istifadəçi adı, ad, soyad, e-poçt ünvanı) saxlanılır.
        Bunlar yalnız giriş üçün lazımdır və hesabdan çıxdıqda silinir. Giriş tokeni 30 gün etibarlıdır.
      </p>
    ),
  },
  {
    id: 'saxlama',
    title: 'Məlumatları nə qədər saxlayırıq',
    body: (
      <>
        <p>Məlumatların hesabın aktiv olduğu müddətdə saxlanılır; hazırda avtomatik silinmə müddəti müəyyən edilməyib.</p>
        <p>
          Hesabını sildikdə hesab deaktiv edilir, platformada göstərilmir və onunla daxil olmaq mümkün olmur. Hazırkı
          versiyada isə hesab məlumatların və paylaşdığın məzmun verilənlər bazasından tam silinmir. Sildiyin rəylər,
          sitatlar, şərhlər və mesajlar da gizlədilir, lakin bazada qalır.
        </p>
        <List
          items={[
            <>
              Silinmiş hesab və məzmunun saxlanma müddəti: <Missing>sahibkar müəyyənləşdirməlidir</Missing>.
            </>,
            <>
              Sistem jurnallarının saxlanma müddəti: <Missing>sahibkar müəyyənləşdirməlidir</Missing>.
            </>,
            <>
              Ehtiyat nüsxələr və onların saxlanma müddəti: <Missing>sahibkar təsdiqləməlidir</Missing>.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: 'tehlukesizlik',
    title: 'Təhlükəsizlik',
    body: (
      <>
        <p>
          Sayt HTTPS (TLS) ilə şifrələnmiş əlaqə üzərindən işləyir. Şifrələr birtərəfli heş kimi saxlanılır. Şəxsi
          mesajlar və bildirişlər yalnız aid olduğu istifadəçilərə göstərilir.
        </p>
        <p>
          Yüklədiyin profil şəkli açıq keçid vasitəsilə əlçatandır. Heç bir sistem tam təhlükəsiz deyil: hesabından
          icazəsiz istifadə edildiyini düşünürsənsə, şifrəni dəyiş və bizimlə əlaqə saxla.
        </p>
      </>
    ),
  },
  {
    id: 'huquqlar',
    title: 'Hüquqların',
    body: (
      <>
        <p>Tətbiqdə özün edə bilərsən:</p>
        <List
          items={[
            'profil məlumatlarını, sosial şəbəkə keçidlərini və profil şəklini dəyişmək, profil şəklini silmək;',
            'şifrəni dəyişmək;',
            'rəylərini, sitatlarını, şərhlərini, mesaj və yazışmalarını, öz yaratdığın rəfləri və bildirişləri silmək;',
            'bəyənməni və izləməni geri götürmək;',
            'hesabını silmək.',
          ]}
        />
        <p>Rəy (Feedback) bölməsinə göndərilən mesajları tətbiqdə silmək mümkün deyil.</p>
        <p>
          Məlumatlarının surətini almaq, onlara düzəliş etmək (məsələn, e-poçt ünvanı və ya istifadəçi adı), tam
          silinməsini tələb etmək və ya emalına etiraz etmək üçün bizə <Missing>əlaqə e-poçt ünvanı</Missing> ünvanına
          yaz. Müraciətlərə cavab müddəti: <Missing>sahibkar müəyyənləşdirməlidir</Missing>. Tətbiq olunan qanunvericiliyə
          görə hüquqların: <Missing>hüquqşünas tərəfindən müəyyənləşdirilməlidir</Missing>.
        </p>
      </>
    ),
  },
  {
    id: 'usaqlar',
    title: 'Uşaqlar',
    body: (
      <p>
        Bookla-dan istifadə üçün minimum yaş: <Missing>minimum yaş həddi</Missing>. Qeydiyyat zamanı yaş yoxlanılmır.
      </p>
    ),
  },
  {
    id: 'deyisiklikler',
    title: 'Siyasətdəki dəyişikliklər',
    body: (
      <p>
        Bu siyasəti yeniləyə bilərik. Yeni versiya bu səhifədə dərc olunacaq və yuxarıdakı tarix yenilənəcək. Əhəmiyyətli
        dəyişikliklər barədə istifadəçilərin necə xəbərdar ediləcəyi: <Missing>bildiriş üsulu</Missing>.
      </p>
    ),
  },
  {
    id: 'elaqe',
    title: 'Əlaqə',
    body: (
      <p>
        Məxfiliklə bağlı suallar üçün: <Missing>əlaqə e-poçt ünvanı</Missing>. Platformadan istifadə qaydaları{' '}
        <InlineLink to="/terms">İstifadə şərtlərində</InlineLink> göstərilib.
      </p>
    ),
  },
];

const PrivacyPage = () => (
  <InfoPage
    eyebrow="Hüquqi məlumat"
    title="Məxfilik siyasəti"
    intro="Bu siyasət Bookla-nın hansı şəxsi məlumatları topladığını, onlardan necə istifadə etdiyini və kimlərə ötürdüyünü izah edir."
    updated="9 oktyabr 2026 (layihə)"
    draft
    sections={sections}
  />
);

export default PrivacyPage;
