import { MapPin, Mail, Phone } from 'lucide-react';

export default function ContactPage() {
	return (
		<div className="w-full">
			<section className="mx-auto max-w-7xl px-4 py-6 lg:py-20">
				<div
					className="relative isolate w-full overflow-hidden rounded-2xl"
					style={{
						background:
							'linear-gradient(100.5deg, rgba(0, 75, 38, 0.4) 29.55%, rgba(102, 204, 153, 0.4) 93.8%), radial-gradient(38.35% 93.72% at 18.31% 6.28%, rgba(0, 100, 50, 0.8) 0, rgba(0, 50, 25, 0.8) 100%)',
					}}>
					<div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-green-600/20"></div>
					<div className="relative isolate overflow-hidden px-4 py-12 sm:px-24">
						<p className="w-fit rounded-xl bg-white px-4 py-1 text-center text-base font-semibold uppercase leading-7 text-black lg:text-left">
							Get in touch
						</p>
						<h2 className="mt-3 max-w-md text-4xl font-semibold text-white md:text-6xl">
							How Can You <span className="text-blue-300"> Reach Us</span>?
						</h2>
						<p className="my-auto mt-3 max-w-2xl text-base text-gray-300 md:text-lg">
							If you need to get in touch with Muskan Online Shop, there are several ways to contact us.
						</p>
						<div className="mt-8 grid w-full grid-cols-1 gap-4 text-lg sm:grid-cols-2 lg:grid-cols-3">
							<a
								className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
								href="tel:+8801799804899">
								<Phone className="h-7 w-7 text-green-500" />
								01799804899
							</a>
							<a
								className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors"
								href="mailto:info@muskanonlineshop.com">
								<Mail className="h-7 w-7 text-red-500" />
								info@muskanonlineshop.com
							</a>

							<div className="flex items-start gap-2 text-white">
								<MapPin className="h-7 w-7 text-blue-500 flex-shrink-0 mt-0.5" />
								<span>Block B South Mandail, Zinzira<br />Keranigonj Model Dhaka, Bangladesh</span>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}