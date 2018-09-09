import java.net.URL;
import java.util.Scanner;
import java.util.Date;
import java.util.TimeZone;
import java.util.GregorianCalendar;
import java.time.Month;
import java.text.SimpleDateFormat;
import java.io.IOException;
import java.io.FileInputStream;
import java.io.InputStream;

public class IERSBulletinReader {
	public final static String IERS_BULLETINC_BASE = "https://hpiers.obspm.fr/iers/bul/bulc";
	public final static String IERS_BULLETIND_BASE = "https://hpiers.obspm.fr/iers/bul/buld";
	public static class BulCElement {
		public int TAIUTC;
		public Date fromDate;
		public Date toDate;
	}
	public static class BulDElement {
		public float DUT1;
		public Date fromDate;
		public int number;
	}
	public static Date parseBulletinDate(Scanner s, boolean reverseYearDay) {
		int y = s.nextInt();
		int m = Month.valueOf(s.next().toUpperCase()).getValue();
		int day = s.nextInt();
		int h = Integer.parseInt(s.next().replaceAll("h", ""));
		if (!s.next().equals("UTC")) {
			return null;
		}
		GregorianCalendar c = new GregorianCalendar(TimeZone.getTimeZone("UTC"));
		c.set(reverseYearDay ? day : y, m - 1, reverseYearDay ? y : day, h, 0, 0);
		return c.getTime();
	}
	public static BulCElement bulC_TAIUTC(String line) {
		if (!line.matches("\\s+from .*s\\s*")) {
			return null;
		}
		Scanner lineScanner = new Scanner(line);
		lineScanner.useDelimiter("[,\\s]+");
		BulCElement result = new BulCElement();
		while (lineScanner.hasNext()) {
			String token = lineScanner.next();
			if (token.equals("from") || token.equals("to")) {
				try {
					Date d = parseBulletinDate(lineScanner, false);
					if (token.equals("from")) {
						result.fromDate = d;
					} else {
						result.toDate = d;
					}
				} catch (Exception e) {
					continue;
				}
			} else if (token.equals("UTC-TAI")) {
				lineScanner.next(); /* an equals sign */
				int taiutc = Integer.parseInt(lineScanner.nextLine().replaceAll("[\\ss]", ""));
				result.TAIUTC = -taiutc;
				if (result.fromDate != null) {
					return result;
				}
			}
		}
		return null;
	}
	public static BulDElement bulD_DUT1(Scanner file) {
		BulDElement result = new BulDElement();
		while (file.hasNextLine()) {
			String l = file.nextLine();
			Scanner lineScanner = new Scanner(l);
			if (l.matches("\\s*DUT1 = [+-][0-9.]+ s\\s*")) {
				while (lineScanner.hasNext()) {
					if (lineScanner.hasNextFloat()) {
						result.DUT1 = lineScanner.nextFloat();
					} else {
						lineScanner.next();
					}
				}
				continue;
			} else if (l.matches("\\s*Bulletin D [0-9]+\\s*")) {
				while (lineScanner.hasNext()) {
					if (lineScanner.hasNextInt()) {
						result.number = lineScanner.nextInt();
					} else {
						lineScanner.next();
					}
				}
				continue;
			}
			try {
				lineScanner.useDelimiter("[,\\s]+");
				Date d = parseBulletinDate(lineScanner, true);
				if (d != null) {
					result.fromDate = d;
				}
			} catch (Exception e) {
				continue;
			}
		}
		return result;
	}
	public static void main (String args[]) throws IOException {
		InputStream bulCStream = null;
		InputStream bulDStream = null;
		InputStream bulDOldStream = null;
		for (String a : args) {
			if (a.startsWith("bulc=")) {
				bulCStream = new FileInputStream(a.substring(5));
			} else if (a.startsWith("buld=")) {
				bulDStream = new FileInputStream(a.substring(5));
			} else if (a.startsWith("buldOld=")) {
				bulDOldStream = new FileInputStream(a.substring(8));
			}
		}
		if (bulCStream == null) {
			bulCStream = new URL(IERS_BULLETINC_BASE + "/bulletinc.dat").openStream();
		}
		if (bulDStream == null) {
			bulDStream = new URL(IERS_BULLETIND_BASE + "/bulletind.dat").openStream();
		}
		System.out.print("{\"bulc\":[");
		/* parse bulletin c for leap second information and tai-utc */
		Scanner bulCScanner = new Scanner(bulCStream);
		boolean first = true;
		while (bulCScanner.hasNextLine()) {
			String bulletinLine = bulCScanner.nextLine();
			BulCElement bce = bulC_TAIUTC(bulletinLine);
			if (bce != null) {
				if (!first) {
					System.out.print(',');
				}
				System.out.format("{\"from\":%d,\"to\":%d,\"taiutc\":%d}", bce.fromDate.getTime() / 1000, (bce.toDate != null) ? (bce.toDate.getTime() / 1000) : -1, bce.TAIUTC);
				first = false;
			}
		}
		bulCScanner.close();
		System.out.print("],\"buld\":[");
		/* read dut1 from bulletin d */
		Scanner bulDScanner = new Scanner(bulDStream);
		BulDElement result = bulD_DUT1(bulDScanner);
		bulDScanner.close();
		if (result != null) {
			System.out.format("{\"from\":%d,\"dut1\":%.1f}", result.fromDate.getTime() / 1000, result.DUT1);
		}
		/* if date is in future read old bulletin d */
		if (result.fromDate.getTime() > new Date().getTime()) {
			if (bulDOldStream == null) {
				bulDOldStream = new URL(String.format("%s/bulletind.%d", IERS_BULLETIND_BASE, result.number - 1)).openStream();
			}
			bulDScanner = new Scanner(bulDOldStream);
			result = bulD_DUT1(bulDScanner);
			bulDScanner.close();
			if (result != null) {
				System.out.format(",{\"from\":%d,\"dut1\":%.1f}", result.fromDate.getTime() / 1000, result.DUT1);
			}
		}
		System.out.println("]}");
	}
}
