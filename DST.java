import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.LocalDate;
import java.util.Calendar;
import java.util.Date;
import java.util.function.Consumer;
import java.util.function.ObjIntConsumer;
import java.util.stream.Stream;
import java.util.Iterator;
import java.io.PrintStream;
public class DST {
	public static class DSTEntry {
		LocalDate d;
		LocalTime t; /* UTC or local */
		double setOffset;
	}
	/* Precomputes US/Canadian, European, and Australian DST rules. */
	public static LocalDate getDSTForMonth(int year, int month, int dayNumber, DayOfWeek which, boolean endOrStart) {
		if (endOrStart) {
			LocalDate lastOf = LocalDate.of(year, month, 28).plusWeeks(1).with(which);
			/* Brute force solution, I know there's a better way of doing it,
			but it may be subject to off-by-one errors */
			int n = 0;
			for (int i = 0; i < 7; i++) {
				if (lastOf.getMonth().getValue() == month) {
					n++;
				}
				if (n == dayNumber) {
					return lastOf;
				}
				lastOf = lastOf.minusWeeks(1);
			}
		} else {
			LocalDate firstOf = LocalDate.of(year, month, 1).minusWeeks(1).with(which);
			int n = 0;
			for (int i = 0; i < 7; i++) {
				if (firstOf.getMonth().getValue() == month) {
					n++;
				}
				if (n == dayNumber) {
					return firstOf;
				}
			firstOf = firstOf.plusWeeks(1);
			}
		}
		/* Should not happen */
		throw new RuntimeException("DST error");
	}
	/* Technically year should be first but is placed second to fit ObjIntConsumer */
	public static void americanDST(Consumer<DSTEntry> c, int year) {
		DSTEntry e = new DSTEntry();
		e.d = getDSTForMonth(year, 3, 2, DayOfWeek.SUNDAY, false);
		e.t = LocalTime.of(2, 0);
		e.setOffset = 1;
		c.accept(e);
		e = new DSTEntry();
		e.d = getDSTForMonth(year, 11, 1, DayOfWeek.SUNDAY, false);
		e.t = LocalTime.of(1, 0);
		e.setOffset = 0;
		c.accept(e);
	}
	public static void europeanDST(Consumer<DSTEntry> c, int year) {
		DSTEntry e = new DSTEntry();
		e.d = getDSTForMonth(year, 3, 1, DayOfWeek.SUNDAY, true);
		e.t = LocalTime.of(1, 0);
		e.setOffset = 1;
		c.accept(e);
		e = new DSTEntry();
		e.d = getDSTForMonth(year, 10, 1, DayOfWeek.SUNDAY, true);
		e.t = LocalTime.of(1, 0);
		e.setOffset = 0;
		c.accept(e);
	}
	public static void australianDST(Consumer<DSTEntry> c, int year) {
		DSTEntry e = new DSTEntry();
		e.d = getDSTForMonth(year, 4, 1, DayOfWeek.SUNDAY, false);
		e.t = LocalTime.of(2, 0);
		e.setOffset = 0;
		c.accept(e);
		e = new DSTEntry();
		e.d = getDSTForMonth(year, 10, 1, DayOfWeek.SUNDAY, false);
		e.t = LocalTime.of(2, 0);
		e.setOffset = 1;
		c.accept(e);
	}
	public static void printDST(ObjIntConsumer<Consumer<DSTEntry>> calc, String ident, boolean useUTC, PrintStream out) {
		int startYear = Calendar.getInstance().get(Calendar.YEAR) - 1;
		out.printf("\"%s\": {\"useUTC\": %s, \"times\": {", ident, String.valueOf(useUTC));
		Stream.Builder<DSTEntry> entries = Stream.builder();
		for (int i = 0; i < 20; i++) {
			calc.accept(entries::accept, startYear + i);
		}
		Stream<String> ent = entries.build().map(e -> String.format("\"%sT%s\": %f", e.d, e.t, e.setOffset));
		Iterable<String> f = new Iterable<String>() {
			@Override
			public Iterator<String> iterator() {
				return ent.iterator();
			}
		};
		out.println(String.join(",\n", f));
		out.print("} }");
	}
	public static void main(String[] args) {
		System.out.println("/* Automatically generated file, do not edit. */");
		System.out.printf("var clock_lastUpdateTime = %d;\n", new Date().getTime());
		System.out.print("var dst = {");
		printDST(DST::americanDST, "us", false, System.out);
		System.out.print(",");
		printDST(DST::europeanDST, "eu", true, System.out);
		System.out.print(",");
		printDST(DST::australianDST, "au", false, System.out);
		System.out.println("};");
	}
}