# Next.js URL Shortener

This project is a modern URL shortening service developed using Next.js, TypeScript, and MongoDB. Users can shorten long URLs, create custom short codes, and view click statistics.

## Features

- URL shortening
- Custom short code creation
- Multiple domain support
- Click statistics (total clicks, unique clicks, country-based and device-based distribution)
- Edit and delete shortened URLs
- Responsive design

## Technologies

- Next.js 13+
- TypeScript
- MongoDB
- Tailwind CSS
- React Hooks

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/mugurc/link-shortener.git
   cd link-shortener
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file and add your MongoDB connection information and valid domains:
   ```
   MONGODB_URI=your_mongodb_connection_string
   VALID_DOMAINS=domain1.com,domain2.com,domain3.com
   NEXT_PUBLIC_VALID_DOMAINS=domain1.com,domain2.com,domain3.com
   ```
   Note: In production, replace `NEXT_PUBLIC_BASE_URL` with your actual domain.

4. Run the application in development mode:
   ```
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser.

## Usage

1. On the home page, enter the URL you want to shorten.
2. Select a domain from the available options.
3. Optionally add a custom short code, title, and note.
4. Click the "Shorten URL" button.
5. Copy the shortened URL and share it.
6. To view statistics, click the "View Stats" button in the URL list.

## API Endpoints

- `POST /api/shorten`: Creates a new short URL
- `GET /api/[shortCode]`: Redirects the short code to the original URL
- `GET /api/stats/[shortCode]`: Retrieves statistics for a specific short URL
- `GET /api/urls`: Lists all shortened URLs
- `PUT /api/urls/[id]`: Updates a specific URL entry
- `DELETE /api/urls/[id]`: Deletes a specific URL entry and its associated statistics

## Contributing

1. Fork this repository
2. Create a new feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

## Contact

Mahmut Uğur Çeker - [@Mugurc](https://x.com/Mugurc) - mceker@gmail.com

Project Link: [https://github.com/mugurc/link-shortener](https://github.com/mugurc/link-shortener)
