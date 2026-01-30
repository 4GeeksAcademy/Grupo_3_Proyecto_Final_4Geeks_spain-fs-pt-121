export const Footer = () => {
	return (
		<footer className="mt-auto border-top bg-light">
			<div className="container py-4">
				<div className="row align-items-center">
					{/* Marca */}
					<div className="col-12 col-md-4 text-center text-md-start mb-3 mb-md-0">
						<span className="fw-bold">Finza</span>
						<p className="text-muted small mb-0">
							Controla tus gastos de forma simple.
						</p>
					</div>

					
					<div className="col-12 col-md-4 text-center mb-3 mb-md-0">
						<a href="#" className="text-muted mx-2 small text-decoration-none">
							Privacidad
						</a>
						<a href="#" className="text-muted mx-2 small text-decoration-none">
							Términos
						</a>
						<a href="#" className="text-muted mx-2 small text-decoration-none">
							Soporte
						</a>
					</div>

					
					<div className="col-12 col-md-4 text-center text-md-end">
						<span className="text-muted small">
							© {new Date().getFullYear()} Finza
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
};