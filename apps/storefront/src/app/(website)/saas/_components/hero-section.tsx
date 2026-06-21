import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatedHeroHeading } from './animated-hero-heading'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'

export function HeroSection() {
  return (
    <section className='mx-auto flex flex-col items-center gap-6 bg-linear-to-b from-background from-40% via-primary/10 to-background px-4 py-20 text-center sm:from-10% 2xl:pt-60'>
      <AnimatedHeroHeading />
      {/* Non animated heading */}
      {/* <h1 className='px-4 max-w-5xl text-4xl sm:font-[350] leading-normal md:text-6xl md:leading-snug'>
        What are you building today?
      </h1> */}
      <p className='max-w-3xl pb-2 text-lg leading-7 text-pretty text-muted-foreground sm:text-xl sm:leading-8'>
        A free github template with a landing page, dashboard, auth, database,
        and everything you need to launch your app, gather feedback, and iterate
        fast.
      </p>
      <div className='flex-col items-center gap-4 pb-4'>
					<div className="flex flex-col sm:flex-row gap-3 max-w-md pt-4 w-full">
						<InputGroup className="h-10">
							<InputGroupInput placeholder="نام فروشگاه شما"></InputGroupInput>
							<InputGroupAddon align="inline-end">
								{/* Fix hardcoded URL */}
								<InputGroupText>.s5arc.store</InputGroupText>
							</InputGroupAddon>
						</InputGroup>
						<Button size="lg">فروشگاهتو بساز</Button>
					</div>
					<div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 w-full">
						<div className="flex items-center gap-2">
							<i className="w-4 h-4 text-foreground" data-feather="check" />
							14 روز رایگان
						</div>
						{/* <div className="flex items-center gap-2">
							<i className="w-4 h-4 text-foreground" data-feather="check" />
							No credit card
						</div> */}
					</div>

      </div>
      <div className='relative aspect-video w-full max-w-6xl overflow-hidden rounded-xl shadow-xs 2xl:mt-20 2xl:max-w-[1600px]'>
        <Image
          src='/fake-saas.png'
          alt='demo image'
          priority
          fill
          className='object-contain object-top'
        />
        <div className='absolute right-0 bottom-0 left-0 h-2/3 bg-linear-to-t from-white to-transparent' />
      </div>
      <a
        className='text-xs text-muted-foreground'
        href='https://ui.shadcn.com/examples/tasks'
        target='_blank'
        rel='noopener noreferrer'
      >
        Image by <span className='underline underline-offset-4'>shadcn</span>
      </a>
    </section>
  )
}
