import InfoPage, { InlineLink, List, Missing } from './InfoPage';

// Features listed here are the ones the app actually has (checked against the frontend routes and the
// backend API). Keep this in sync with the status tags on the landing page.

const sections = [
  {
    id: 'bookla-nedir',
    title: 'Bookla nədir',
    body: (
      <>
        <p>
          Bookla oxucular üçün sosial platformadır. Burada kitabları kəşf edə, oxuduğun və oxumaq istədiyin kitabları
          rəflərdə saxlaya, rəy və sitatlarını paylaşa, digər oxucuları izləyə və onlarla yazışa bilərsən.
        </p>
        <p>
          Platforma bookla.org ünvanında fəaliyyət göstərir və pulsuzdur. Bu səhifə, Məxfilik siyasəti və İstifadə
          şərtləri Azərbaycan dilindədir; tətbiqin daxili bölmələri hazırda ingilis dilindədir.
        </p>
      </>
    ),
  },
  {
    id: 'imkanlar',
    title: 'Bu gün nə edə bilərsən',
    body: (
      <>
        <List
          items={[
            'hesab yaratmaq və e-poçt ünvanını təsdiqləmək;',
            'kitab kataloqunda ad, müəllif və janr üzrə axtarış etmək;',
            'kitabları üç standart rəfə (oxumaq istədiklərin, hazırda oxuduqların və oxuyub bitirdiklərin) və öz yaratdığın rəflərə əlavə etmək;',
            'kitablara 1–5 ulduzla qiymət vermək və rəy yazmaq;',
            'sitat paylaşmaq, digər oxucuların paylaşımlarını bəyənmək və onlara şərh yazmaq;',
            'sosial axında oxucuların fəaliyyətini izləmək, oxucuları axtarmaq və izləmək;',
            'digər istifadəçilərlə şəxsi mesajlaşmaq;',
            'illik oxu hədəfi qoymaq;',
            'süni intellekt əsasında kitab tövsiyələri almaq;',
            'Bookla xəbərlərini oxumaq və komandaya rəy göndərmək.',
          ]}
        />
        <p>Xəbərlər bölməsindən başqa, tətbiqin bütün bölmələri hesab və təsdiqlənmiş e-poçt ünvanı tələb edir.</p>
      </>
    ),
  },
  {
    id: 'hazirlanir',
    title: 'Hələ olmayan imkanlar',
    body: (
      <>
        <p>Ana səhifədə təsvir olunan bəzi imkanlar hazırda tətbiqdə yoxdur:</p>
        <List
          items={[
            'oxu irəliləyişi — hazırlanır: texniki əsası var, lakin tətbiqdə hələ bölməsi yoxdur;',
            'kitab klubları, klub daxilində səsvermə və klub görüşləri — mövcud deyil;',
            'şəxsi qeydlər — mövcud deyil (sitatlar mövcuddur);',
            'klub müzakirələri — mövcud deyil (kitab rəyləri və şərhlər mövcuddur).',
          ]}
        />
        <p>
          Ana səhifədəki klublar, səsvermə, görüşlər və tətbiq görüntüləri nümunədir: onlar real istifadəçilərə və ya
          məlumatlara aid deyil.
        </p>
      </>
    ),
  },
  {
    id: 'kim-idare-edir',
    title: 'Platformanı kim idarə edir',
    body: (
      <>
        <p>
          Bookla-nı idarə edən şəxs və ya təşkilat: <Missing>şirkətin və ya fərdi sahibkarın rəsmi adı</Missing>.
        </p>
        <p>
          Ünvan: <Missing>hüquqi ünvan</Missing>.
        </p>
      </>
    ),
  },
  {
    id: 'elaqe',
    title: 'Əlaqə',
    body: (
      <>
        <p>
          Bizə <Missing>əlaqə e-poçt ünvanı</Missing> ünvanına yaza bilərsən. Hesabın varsa, tətbiqdəki{' '}
          <InlineLink to="/feedback">Rəy (Feedback)</InlineLink> bölməsindən də istifadə edə bilərsən.
        </p>
        <p>
          Məlumatlarından necə istifadə etdiyimizi <InlineLink to="/privacy">Məxfilik siyasətində</InlineLink>,
          platformadan istifadə qaydalarını isə <InlineLink to="/terms">İstifadə şərtlərində</InlineLink> oxuya bilərsən.
        </p>
      </>
    ),
  },
];

const AboutPage = () => (
  <InfoPage
    eyebrow="Bookla haqqında"
    title="Haqqımızda"
    intro="Bookla kitabları kəşf etmək, oxuduqlarını yadda saxlamaq və digər oxucularla fikir bölüşmək üçün yaradılıb."
    draft="Bu səhifə layihədir: rəngli mötərizədə göstərilən məlumatlar hələ sahibkar tərəfindən təqdim edilməlidir."
    sections={sections}
  />
);

export default AboutPage;
