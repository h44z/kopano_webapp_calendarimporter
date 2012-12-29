/**
 * A small tool to create our timezone mappings list =)
 */
import java.util.TimeZone;

public class Main {	
	static String map[] = new String[51]; // one field = 30 minutes step
	
	private static void initMap() {
		map[0] = "Pacific/Midway";
		map[1] = "";
		map[2] = "Pacific/Fakaofo";
		map[3] = "Pacific/Marquesas";
		map[4] = "America/Anchorage";
		map[5] = "";
		map[6] = "America/Dawson";
		map[7] = "";
		map[8] = "America/Dawson_Creek";
		map[9] = "";
		map[10] = "America/Chicago";
		map[11] = "America/Caracas";
		map[12] = "America/Detroit";
		map[13] = "America/Caracas";
		map[14] = "America/Santiago";
		map[15] = "America/St_Johns";
		map[16] = "America/Sao_Paulo";
		map[17] = "";
		map[18] = "America/Noronha";
		map[19] = "";
		map[20] = "Atlantic/Cape_Verde";
		map[21] = "";
		map[22] = "Africa/Abidjan";
		map[23] = "";
		map[24] = "Europe/Vienna";
		map[25] = "";
		map[26] = "Asia/Jerusalem";
		map[27] = "";
		map[28] = "Africa/Addis_Ababa";
		map[29] = "Asia/Tehran";
		map[30] = "Asia/Dubai";
		map[31] = "Asia/Kabul";
		map[32] = "Antarctica/Mawson";
		map[33] = "Asia/Colombo";
		map[34] = "Antarctica/Vostok";
		map[35] = "Asia/Rangoon";
		map[36] = "Antarctica/Davis";
		map[37] = "";
		map[38] = "Antarctica/Casey";
		map[39] = "";
		map[40] = "Asia/Dili";
		map[41] = "Australia/Darwin";
		map[42] = "Australia/Currie";
		map[43] = "Australia/Lord_Howe";
		map[44] = "Antarctica/Macquarie";
		map[45] = "Pacific/Norfolk";
		map[46] = "Antarctica/McMurdo";
		map[47] = "";
		map[48] = "Pacific/Enderbury";
		map[49] = "";
		map[50] = "Pacific/Kiritimati";
	}
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		initMap();
		
		int i = 0;
		for(int time = -660; time < 900; time += 30) {
			
			int hours = time / 60;
			int minutes = Math.abs(time) % 60;
			
			String[] avaiId = TimeZone.getAvailableIDs(time*60*1000);
			
			if(avaiId.length > 0) {
				System.out.printf("\t\t/*%+d:%02d*/\n", hours, minutes);
				for (String string : avaiId) {
					System.out.println("\t\t'" + string + "' : '" + map[i] + "',");
				}
			}
			
			i++;
		}
	}
}
