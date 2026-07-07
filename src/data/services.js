import {
  Monitor,
  Globe,
  MessageSquare,
  Building2,
  Smartphone,
  HelpCircle,
} from 'lucide-react'

export const allServices = [
  {
    id: 'computer-repair',
    icon: Monitor,
    title_ka: 'კომპიუტერის/ტექნიკის შეკეთება',
    title_en: 'Computer & Hardware Repair',
    description_ka:
      'ლეპტოპების, დესკტოპ კომპიუტერების და სხვა ტექნიკის დიაგნოსტიკა, შეკეთება და აღდგენა. აპარატურული და პროგრამული პრობლემების სწრაფი გადაჭრა.',
    description_en:
      'Diagnostics, repair and recovery of laptops, desktop computers and other hardware. Quick resolution of hardware and software issues.',
  },
  {
    id: 'website',
    icon: Globe,
    title_ka: 'ვებსაიტის დამზადება',
    title_en: 'Website Development',
    description_ka:
      'კორპორატიული, პორტფოლიო და ელ-კომერციის ვებსაიტების შექმნა. თანამედროვე დიზაინი, მობილური ადაპტაცია და SEO ოპტიმიზაცია.',
    description_en:
      'Creation of corporate, portfolio and e-commerce websites. Modern design, mobile adaptation and SEO optimization.',
  },
  {
    id: 'technical-consultation',
    icon: MessageSquare,
    title_ka: 'ტექნიკური კონსულტაცია',
    title_en: 'Technical Consultation',
    description_ka:
      'ტექნოლოგიური გადაწყვეტილებების შერჩევაში დახმარება. არქიტექტურის შეფასება, რჩევები აღჭურვილობისა და პროგრამული უზრუნველყოფის ასარჩევად.',
    description_en:
      'Assistance in choosing technology solutions. Architecture evaluation, advice on choosing equipment and software.',
  },
  {
    id: 'it-support-business',
    icon: Building2,
    title_ka: 'IT მხარდაჭერა ბიზნესისთვის',
    title_en: 'IT Support for Business',
    description_ka:
      'ოფისის IT ინფრასტრუქტურის მოვლა, სერვერების მართვა და მუდმივი ტექნიკური მხარდაჭერა. შეთანხმებითი პაკეტები მცირე და საშუალო ბიზნესისთვის.',
    description_en:
      'Maintenance of office IT infrastructure, server management and ongoing technical support. Custom packages for small and medium businesses.',
  },
  {
    id: 'gadget-repair',
    icon: Smartphone,
    title_ka: 'სმარტფონის/გაჯეტის შეკეთება',
    title_en: 'Smartphone & Gadget Repair',
    description_ka:
      'ტელეფონების, ტაბლეტების და სხვა გაჯეტების ეკრანის, ელემენტისა და სხვა კომპონენტების შეკეთება, მონაცემების შენახვის შესაძლებლობით.',
    description_en:
      'Repair of screens, batteries and other components for phones, tablets and gadgets. Data preservation options available.',
  },
  {
    id: 'custom',
    icon: HelpCircle,
    title_ka: 'სხვა',
    title_en: 'Other',
    description_ka:
      'ვერ იპოვეთ ის, რასაც ეძებდით? დაგვიკავშირდით და ჩვენ ვიპოვით შესაბამის სპეციალისტს თქვენი ამოცანისთვის.',
    description_en:
      'Did not find what you were looking for? Contact us and we will find the right specialist for your task.',
    custom: true,
  },
]

export const popularServices = allServices.filter((s) => !s.custom)

export function getServiceById(id) {
  return allServices.find((s) => s.id === id) ?? null
}
