import InfoPage, { InlineLink, List, Missing } from './InfoPage';

// Draft terms. Every statement about what the platform does was checked against the frontend and the
// backend API; facts only the owner can supply are marked with <Missing>.

const sections = [
  {
    id: 'qebul',
    title: 'Şərtlərin qəbulu',
    body: (
      <>
        <p>
          Bookla platforması (bookla.org) <Missing>platformanı idarə edən şəxsin və ya təşkilatın rəsmi adı</Missing>{' '}
          (bundan sonra “Bookla” və ya “biz”) tərəfindən idarə olunur.
        </p>
        <p>
          Hesab yaratmaqla və ya platformadan istifadə etməklə bu şərtləri və{' '}
          <InlineLink to="/privacy">Məxfilik siyasətini</InlineLink> qəbul etmiş olursan. Şərtlərin qüvvəyə minmə
          tarixi: <Missing>tarix</Missing>.
        </p>
      </>
    ),
  },
  {
    id: 'hesab',
    title: 'Hesab',
    body: (
      <List
        items={[
          'Qeydiyyat üçün ad, soyad, istifadəçi adı, e-poçt ünvanı və ən azı 6 simvoldan ibarət şifrə tələb olunur.',
          'Platformanın əksər bölmələrindən istifadə etmək üçün e-poçt ünvanını təsdiqləməlisən.',
          <>
            Bookla-dan istifadə üçün minimum yaş: <Missing>minimum yaş həddi</Missing>.
          </>,
          'Qeydiyyat zamanı doğru məlumat verməli, şifrəni heç kimlə paylaşmamalı və hesabında baş verən fəaliyyətə görə məsuliyyət daşımalısan.',
          'Hesabından icazəsiz istifadə edildiyini düşünürsənsə, dərhal şifrəni dəyiş və bizə xəbər ver.',
          'İstifadəçi adını və e-poçt ünvanını tətbiqdə özün dəyişə bilmirsən; bunun üçün bizimlə əlaqə saxla.',
        ]}
      />
    ),
  },
  {
    id: 'xidmet',
    title: 'Xidmət',
    body: (
      <>
        <p>
          Bookla hazırda bu imkanları təqdim edir: kitab kataloqu və axtarış, kitab rəfləri, qiymət və rəylər, sitatlar,
          şərhlər və bəyənmələr, sosial axın, oxucuları izləmə, şəxsi mesajlar, illik oxu hədəfi, süni intellekt
          tövsiyələri və xəbərlər. Xidmət pulsuzdur.
        </p>
        <p>
          Ana səhifədə “Mövcud deyil” və ya “Tezliklə” kimi işarələnmiş imkanlar (məsələn, kitab klubları, səsvermə və
          görüşlər) xidmətin bir hissəsi deyil.
        </p>
        <p>
          Platformanı inkişaf etdirdikcə imkanları dəyişə, yenilərini əlavə edə və ya bəzilərini dayandıra bilərik.
          Xidmətin fasiləsiz və xətasız işləyəcəyinə zəmanət vermirik.
        </p>
      </>
    ),
  },
  {
    id: 'mezmun',
    title: 'Sənin məzmunun',
    body: (
      <>
        <p>
          Paylaşdığın rəylər, qiymətlər, sitatlar, şərhlər, bəyənmələr, rəflərin və profil məlumatların digər
          istifadəçilərə görünür. Şəxsi mesajları yalnız sən və həmsöhbətin görür.
        </p>
        <p>
          Paylaşdığın məzmunun hüquqları sənə məxsus qalır. Onu paylaşmaqla bizə həmin məzmunu Bookla-da saxlamaq və
          digər istifadəçilərə göstərmək icazəsi verirsən.
        </p>
        <p>
          Paylaşdığın məzmuna görə sən cavabdehsən. Kitablardan sitat gətirərkən mənbəni göstər və müəllif hüquqlarına
          hörmət et.
        </p>
      </>
    ),
  },
  {
    id: 'qadagalar',
    title: 'Qadağan olunan davranış',
    body: (
      <>
        <p>Bookla-da aşağıdakılar qadağandır:</p>
        <List
          items={[
            'qanunsuz, təhqiramiz, nifrət və ya zorakılığa çağıran məzmun paylaşmaq;',
            'digər istifadəçiləri incitmək, onlara spam və ya istənməyən mesajlar göndərmək;',
            'başqasının adından çıxış etmək və ya özün haqqında yalan məlumat vermək;',
            'başqalarının şəxsi məlumatlarını onların razılığı olmadan paylaşmaq;',
            'müəllif hüquqlarını pozan məzmun, məsələn, kitabların geniş hissələrini yerləşdirmək;',
            'zərərli fayl yükləmək, sistemə icazəsiz daxil olmağa və ya digər istifadəçilərin məlumatlarını toplamağa cəhd etmək;',
            'platformanın işini pozmaq və ya ondan avtomatlaşdırılmış vasitələrlə kütləvi istifadə etmək.',
          ]}
        />
      </>
    ),
  },
  {
    id: 'moderasiya',
    title: 'Moderasiya',
    body: (
      <>
        <p>
          Bookla administratorları bu şərtləri pozan rəyləri və hesabları silə, hesab məlumatlarını (ad, soyad,
          istifadəçi adı və e-poçt ünvanı) düzəldə bilər.
        </p>
        <p>
          Pozuntu barədə tətbiqdəki <InlineLink to="/feedback">Rəy (Feedback)</InlineLink> bölməsindən və ya{' '}
          <Missing>əlaqə e-poçt ünvanı</Missing> ünvanına yazaraq məlumat verə bilərsən.
        </p>
        <p>
          Məzmunun silinməsi və ya hesabın bağlanması barədə xəbərdarlıq və etiraz qaydası:{' '}
          <Missing>sahibkar müəyyənləşdirməlidir</Missing>.
        </p>
      </>
    ),
  },
  {
    id: 'suni-intellekt',
    title: 'Süni intellekt tövsiyələri',
    body: (
      <p>
        Kitab tövsiyələri OpenAI-ın süni intellekt modeli ilə avtomatik yaradılır. Onlar səhv və ya natamam ola bilər,
        həmçinin Bookla kataloqunda olmayan kitablara aid ola bilər. Tövsiyələri yalnız məsləhət kimi qəbul et.
      </p>
    ),
  },
  {
    id: 'kenar-mezmun',
    title: 'Kənar xidmətlər və keçidlər',
    body: (
      <p>
        Bəzi kitab üz qabıqları Open Library xidmətindən yüklənir. İstifadəçilərin profillərində göstərilən kənar
        saytların məzmununa görə Bookla məsuliyyət daşımır.
      </p>
    ),
  },
  {
    id: 'hesabin-silinmesi',
    title: 'Hesabın silinməsi',
    body: (
      <>
        <p>
          Hesabını istənilən vaxt profil ayarlarında silə bilərsən. Silinmiş hesab platformada göstərilmir və onunla
          yenidən daxil olmaq mümkün olmur. Bu zaman məlumatlarınla nə baş verdiyi{' '}
          <InlineLink to="/privacy#saxlama">Məxfilik siyasətində</InlineLink> izah olunur.
        </p>
        <p>Bu şərtləri ciddi şəkildə pozan hesabları biz də silə bilərik.</p>
      </>
    ),
  },
  {
    id: 'mesuliyyet',
    title: 'Məsuliyyətin məhdudlaşdırılması',
    body: (
      <p>
        Bookla “olduğu kimi” təqdim olunur. Qanunla icazə verilən həddə biz istifadəçilərin paylaşdığı məzmuna, kənar
        xidmətlərin işinə və xidmətdəki fasilələrə görə məsuliyyət daşımırıq.
      </p>
    ),
  },
  {
    id: 'deyisiklikler',
    title: 'Şərtlərdəki dəyişikliklər',
    body: (
      <p>
        Şərtləri yeniləyə bilərik. Yeni versiya bu səhifədə dərc olunacaq və yuxarıdakı tarix yenilənəcək. Əhəmiyyətli
        dəyişikliklər barədə istifadəçilərin necə xəbərdar ediləcəyi: <Missing>bildiriş üsulu</Missing>.
      </p>
    ),
  },
  {
    id: 'huquq',
    title: 'Tətbiq olunan hüquq',
    body: (
      <p>
        Bu şərtlərə <Missing>tətbiq olunan qanunvericilik</Missing> tətbiq olunur. Mübahisələrə{' '}
        <Missing>mübahisələrə baxan məhkəmə və ya qurum</Missing> baxır.
      </p>
    ),
  },
  {
    id: 'elaqe',
    title: 'Əlaqə',
    body: (
      <p>
        Suallar üçün: <Missing>əlaqə e-poçt ünvanı</Missing>. Hesabın varsa, tətbiqdəki{' '}
        <InlineLink to="/feedback">Rəy (Feedback)</InlineLink> bölməsindən də yaza bilərsən.
      </p>
    ),
  },
];

const TermsPage = () => (
  <InfoPage
    eyebrow="Hüquqi məlumat"
    title="İstifadə şərtləri"
    intro="Bu şərtlər Bookla platformasından istifadə qaydalarını, sənin və bizim öhdəliklərimizi müəyyən edir."
    updated="9 oktyabr 2026 (layihə)"
    draft
    sections={sections}
  />
);

export default TermsPage;
