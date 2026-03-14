package pl.ocado.library.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


// On its own the app won't start. You need to change your postgres password in resources/application.properties
// and create your local ocado_library_db database in order to run it correctly. Or just uncomment the h2 setup
// and comment the postgres one.

@SpringBootApplication
public class OcadoLibraryBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(OcadoLibraryBackendApplication.class, args);
	}

}
